import bcrypt from "bcryptjs";

// bcryptjs: pure-JS, no native build step — reliable on macOS and Vercel alike.
// (argon2 preferred for production; documented as a post-POC upgrade in docs/04.)
const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/** Minimal password policy (FR-A3). */
export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 10) return "Password must be at least 10 characters.";
  if (!/[a-zA-Z]/.test(pw)) return "Password must contain a letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain a number.";
  return null;
}
