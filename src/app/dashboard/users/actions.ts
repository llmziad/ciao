"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/rbac";
import { issueToken } from "@/lib/auth/tokens";
import { uniqueSlug } from "@/lib/slug";
import { storageService } from "@/lib/services/storage";
import { inviteUserSchema } from "@/lib/validation";
import { env } from "@/lib/env";
import { zodToFieldErrors, type FormState } from "@/lib/form";
import type { TokenType, User } from "@prisma/client";

async function requireSuper(): Promise<User> {
  const caller = await getCurrentUser();
  if (!caller) redirect("/login");
  if (caller.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return caller;
}

async function activeSuperAdminCount(): Promise<number> {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", status: "ACTIVE" } });
}

function tokenLink(raw: string, mode: "invite" | "reset"): string {
  return `${env.appUrl}/set-password?mode=${mode}&token=${raw}`;
}

export async function inviteUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSuper();

  const parsed = inviteUserSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { fieldErrors: zodToFieldErrors(parsed.error) };
  const { email, name, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { fieldErrors: { email: "A user with that email already exists." } };

  const user = await prisma.user.create({
    data: {
      email,
      role,
      status: "ACTIVE",
      profile: { create: { slug: await uniqueSlug(), name } },
    },
  });

  const raw = await issueToken(user.id, "INVITE");

  revalidatePath("/dashboard/users");
  return {
    ok: true,
    message: `${email} added. Copy their invite link below to share it.`,
    link: tokenLink(raw, "invite"),
  };
}

export type AuthLinkResult = { ok: boolean; link?: string; error?: string };

/**
 * Super-admin generates a fresh invite or password-reset link for a user.
 * Emails are disabled in V1 — the link is copied & shared manually.
 */
export async function generateAuthLinkAction(
  userId: string,
  kind: "invite" | "reset",
): Promise<AuthLinkResult> {
  await requireSuper();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "User not found." };
  if (user.status !== "ACTIVE") {
    return { ok: false, error: "Reactivate the user before generating a link." };
  }
  const type: TokenType = kind === "invite" ? "INVITE" : "RESET";
  const raw = await issueToken(user.id, type);
  return { ok: true, link: tokenLink(raw, kind) };
}

export async function deactivateUserAction(formData: FormData): Promise<void> {
  const caller = await requireSuper();
  const userId = String(formData.get("userId") || "");
  if (userId === caller.id) throw new Error("You cannot deactivate your own account.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (target.role === "SUPER_ADMIN" && (await activeSuperAdminCount()) <= 1) {
    throw new Error("Cannot deactivate the last active super admin.");
  }
  await prisma.user.update({ where: { id: userId }, data: { status: "DEACTIVATED" } });
  revalidatePath("/dashboard/users");
}

export async function reactivateUserAction(formData: FormData): Promise<void> {
  await requireSuper();
  const userId = String(formData.get("userId") || "");
  await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  revalidatePath("/dashboard/users");
}

export async function setRoleAction(formData: FormData): Promise<void> {
  const caller = await requireSuper();
  const userId = String(formData.get("userId") || "");
  const role = formData.get("role") === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return;
  if (
    target.role === "SUPER_ADMIN" &&
    role === "ADMIN" &&
    (await activeSuperAdminCount()) <= 1
  ) {
    throw new Error("Cannot remove the last super admin.");
  }
  if (userId === caller.id && role === "ADMIN") {
    throw new Error("You cannot revoke your own super-admin role.");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const caller = await requireSuper();
  const userId = String(formData.get("userId") || "");
  if (userId === caller.id) throw new Error("You cannot delete your own account.");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!target) return;
  if (target.role === "SUPER_ADMIN" && (await activeSuperAdminCount()) <= 1) {
    throw new Error("Cannot delete the last active super admin.");
  }

  // Clean up stored photo (cascade handles profile + tokens rows).
  if (target.profile?.photoUrl) {
    await storageService().remove(target.profile.photoUrl);
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/users");
}
