import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Unambiguous base-58 alphabet (no 0/O/I/l).
const ALPHABET = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

export function randomSlug(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Generates a slug guaranteed unique against existing profiles. */
export async function uniqueSlug(length = 8): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = randomSlug(length);
    const existing = await prisma.profile.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  // Extremely unlikely; widen the space.
  return randomSlug(length + 4);
}
