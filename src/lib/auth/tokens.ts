import "server-only";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { TokenType } from "@prisma/client";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Creates a single-use token, storing only its hash. Returns the raw token
 * (used once, in the emailed link). Any prior unused tokens of the same type
 * for the user are invalidated.
 */
export async function issueToken(userId: string, type: TokenType): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  const ttl = type === "INVITE" ? INVITE_TTL_MS : RESET_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);

  await prisma.$transaction([
    prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.authToken.create({ data: { userId, type, tokenHash, expiresAt } }),
  ]);

  return raw;
}

/** Validates a raw token; returns the userId if valid & unused & unexpired. */
export async function consumeToken(
  raw: string,
  type: TokenType,
): Promise<{ userId: string } | null> {
  if (!raw) return null;
  const tokenHash = hashToken(raw);
  const record = await prisma.authToken.findUnique({ where: { tokenHash } });
  if (!record || record.type !== type) return null;
  if (record.usedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;

  await prisma.authToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return { userId: record.userId };
}

/** Validate a token without consuming it (for rendering the set-password form). */
export async function peekToken(
  raw: string,
  type: TokenType,
): Promise<{ userId: string } | null> {
  if (!raw) return null;
  const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!record || record.type !== type || record.usedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  return { userId: record.userId };
}
