import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";
import type { User } from "@prisma/client";

/** Returns the current active user (fresh from DB) or null. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || user.status !== "ACTIVE") return null;
  // Invalidate sessions issued before the last password change.
  if (user.tokenVersion !== session.v) return null;
  return user;
}

/** Redirects to /login if not authenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects non-super-admins to the dashboard. */
export async function requireSuperAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");
  return user;
}

export function isSuperAdmin(user: Pick<User, "role">): boolean {
  return user.role === "SUPER_ADMIN";
}
