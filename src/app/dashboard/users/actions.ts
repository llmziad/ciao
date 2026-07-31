"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/rbac";
import { issueToken } from "@/lib/auth/tokens";
import { uniqueSlug } from "@/lib/slug";
import { emailService } from "@/lib/services/email";
import { storageService } from "@/lib/services/storage";
import { inviteUserSchema } from "@/lib/validation";
import { env } from "@/lib/env";
import { zodToFieldErrors, type FormState } from "@/lib/form";
import type { User } from "@prisma/client";

async function requireSuper(): Promise<User> {
  const caller = await getCurrentUser();
  if (!caller) redirect("/login");
  if (caller.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return caller;
}

async function activeSuperAdminCount(): Promise<number> {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", status: "ACTIVE" } });
}

function inviteLink(raw: string): string {
  return `${env.appUrl}/set-password?mode=invite&token=${raw}`;
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
  const link = inviteLink(raw);
  const usingConsole = !env.resendApiKey;
  try {
    await emailService().sendInvite(email, name, link);
  } catch (e) {
    console.error("Invite email failed:", e);
    if (!usingConsole) {
      return { ok: true, message: `User created, but the invite email failed to send.` };
    }
  }

  revalidatePath("/dashboard/users");
  return {
    ok: true,
    message: `Invitation sent to ${email}.`,
    devLink: usingConsole ? link : undefined,
  };
}

export async function resendInviteAction(formData: FormData): Promise<void> {
  await requireSuper();
  const userId = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) return;
  const raw = await issueToken(user.id, "INVITE");
  try {
    await emailService().sendInvite(user.email, user.profile?.name || user.email, inviteLink(raw));
  } catch (e) {
    console.error("Resend invite failed:", e);
  }
  revalidatePath("/dashboard/users");
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
