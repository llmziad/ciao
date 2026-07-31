"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/rbac";
import { destroySession } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/profile";
import { profileSchema } from "@/lib/validation";
import { normalizeSocial, type SocialNetwork } from "@/lib/socials";
import { processProfilePhoto, isAcceptedImage, MAX_UPLOAD_BYTES } from "@/lib/photo";
import { MAX_UPLOAD_MB } from "@/lib/upload";
import { storageService } from "@/lib/services/storage";
import { randomSlug } from "@/lib/slug";
import { zodToFieldErrors, type FormState } from "@/lib/form";
import type { User } from "@prisma/client";

/** Authorize acting on `targetUserId`: self or super admin. */
async function authorizeTarget(targetUserId: string): Promise<User> {
  const caller = await getCurrentUser();
  if (!caller) redirect("/login");
  if (caller.id !== targetUserId && caller.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return caller;
}

export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/login");
}

export async function saveProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const targetUserId = String(formData.get("userId") || "");
  const caller = await authorizeTarget(targetUserId);

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    instagram: formData.get("instagram"),
    twitter: formData.get("twitter"),
    facebook: formData.get("facebook"),
    linkedin: formData.get("linkedin"),
  });
  if (!parsed.success) return { fieldErrors: zodToFieldErrors(parsed.error) };
  const d = parsed.data;

  const fieldErrors: Record<string, string> = {};
  const social = (net: SocialNetwork, raw?: string): string | null => {
    if (!raw) return null;
    try {
      return normalizeSocial(net, raw);
    } catch (e) {
      fieldErrors[net] = e instanceof Error ? e.message : "Invalid value.";
      return null;
    }
  };
  const socialInstagram = social("instagram", d.instagram);
  const socialTwitter = social("twitter", d.twitter);
  const socialFacebook = social("facebook", d.facebook);
  const socialLinkedin = social("linkedin", d.linkedin);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  await ensureProfile(targetUserId, d.name);
  await prisma.profile.update({
    where: { userId: targetUserId },
    data: {
      name: d.name,
      title: d.title ?? null,
      phone: d.phone ?? null,
      address: d.address ?? null,
      socialInstagram,
      socialTwitter,
      socialFacebook,
      socialLinkedin,
    },
  });

  revalidatePath("/dashboard");
  if (caller.role === "SUPER_ADMIN") revalidatePath(`/dashboard/users/${targetUserId}`);
  return { ok: true, message: "Profile saved." };
}

export type PhotoResult = { ok: boolean; photoUrl?: string; error?: string };

export async function uploadPhotoAction(formData: FormData): Promise<PhotoResult> {
  const targetUserId = String(formData.get("userId") || "");
  await authorizeTarget(targetUserId);

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: `Image must be under ${MAX_UPLOAD_MB} MB.` };
  if (!isAcceptedImage(file.type)) return { ok: false, error: "Use a JPG, PNG, or WebP image." };

  const profile = await ensureProfile(targetUserId);
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const processed = await processProfilePhoto(input);
    const storage = storageService();
    const key = `profiles/${profile.id}/${randomSlug(10)}.webp`;
    const url = await storage.put(key, processed, "image/webp");

    const old = profile.photoUrl;
    await prisma.profile.update({ where: { id: profile.id }, data: { photoUrl: url } });
    if (old) await storage.remove(old);

    revalidatePath("/dashboard");
    return { ok: true, photoUrl: url };
  } catch (e) {
    console.error("Photo upload failed:", e);
    return { ok: false, error: "Could not process that image." };
  }
}

export async function removePhotoAction(userId: string): Promise<PhotoResult> {
  await authorizeTarget(userId);
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.photoUrl) return { ok: true };
  const old = profile.photoUrl;
  await prisma.profile.update({ where: { id: profile.id }, data: { photoUrl: null } });
  await storageService().remove(old);
  revalidatePath("/dashboard");
  return { ok: true };
}
