"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { issueToken } from "@/lib/auth/tokens";
import { emailService } from "@/lib/services/email";
import { emailSchema } from "@/lib/validation";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import type { FormState } from "@/lib/form";

const SUCCESS: FormState = {
  ok: true,
  message: "If an account exists for that email, a reset link has been sent.",
};

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "Enter a valid email." } };
  const email = parsed.data;

  const ip = (headers().get("x-forwarded-for")?.split(",")[0] || "local").trim();
  const limited = rateLimit(`forgot:${ip}`, 5, 15 * 60_000);
  if (!limited.ok) return SUCCESS; // don't reveal rate-limit state

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE") {
    const raw = await issueToken(user.id, "RESET");
    const link = `${env.appUrl}/set-password?mode=reset&token=${raw}`;
    try {
      await emailService().sendPasswordReset(user.email, link);
    } catch (e) {
      // Log but don't leak; user still sees the generic success message.
      console.error("Failed to send reset email:", e);
    }
  }
  return SUCCESS;
}
