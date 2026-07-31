import "server-only";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import type { Profile } from "@prisma/client";

/**
 * Returns the user's profile, creating an empty one (with a slug) if absent.
 * Uses upsert to avoid a TOCTOU race on concurrent first-writes.
 */
export async function ensureProfile(userId: string, fallbackName = "New profile"): Promise<Profile> {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.profile.upsert({
    where: { userId },
    create: { userId, slug: await uniqueSlug(), name: fallbackName },
    update: {},
  });
}
