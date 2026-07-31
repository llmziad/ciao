"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { consumeToken, peekToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session";
import { setPasswordSchema } from "@/lib/validation";
import { zodToFieldErrors, type FormState } from "@/lib/form";

export async function setPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const mode = formData.get("mode") === "invite" ? "INVITE" : "RESET";
  const parsed = setPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: zodToFieldErrors(parsed.error) };

  const strengthError = validatePasswordStrength(parsed.data.password);
  if (strengthError) return { fieldErrors: { password: strengthError } };

  // Validate (without consuming) and confirm the account is active BEFORE we
  // burn the single-use token or write the hash.
  const peek = await peekToken(parsed.data.token, mode);
  if (!peek) {
    return { error: "This link is invalid or has expired. Request a new one." };
  }
  const target = await prisma.user.findUnique({ where: { id: peek.userId } });
  if (!target || target.status !== "ACTIVE") {
    return { error: "This account is deactivated. Contact your administrator." };
  }

  const result = await consumeToken(parsed.data.token, mode);
  if (!result) {
    return { error: "This link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  // Bump tokenVersion so any previously issued sessions are invalidated.
  const user = await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  });

  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    v: user.tokenVersion,
  });
  redirect("/dashboard");
}
