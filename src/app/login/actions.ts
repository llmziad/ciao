"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";
import { zodToFieldErrors, type FormState } from "@/lib/form";

function clientIp(): string {
  const h = headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

/** Only allow relative, same-app redirect targets (blocks open redirects). */
function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  // Must start with a single "/" followed by a non-slash/backslash char, and
  // contain no control chars or backslashes (which browsers normalize to "/").
  if (!/^\/(?![/\\])/.test(n)) return "/dashboard";
  if (/[\\\x00-\x1f]/.test(n)) return "/dashboard";
  return n;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;

  const limited = rateLimit(`login:${clientIp()}:${email}`, 10, 15 * 60_000);
  if (!limited.ok) {
    return { error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError: FormState = { error: "Invalid email or password." };

  // Constant-ish path: always run a compare to reduce user-enumeration timing.
  const ok = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "$2a$12$zzzzzzzzzzzzzzzzzzzzzz.zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzO");

  if (!user || !ok) return genericError;
  if (user.status !== "ACTIVE") {
    return { error: "This account is deactivated. Contact your administrator." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    v: user.tokenVersion,
  });

  redirect(safeNext(formData.get("next")));
}
