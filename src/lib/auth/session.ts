import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env, assertServerEnv } from "@/lib/env";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "icao_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h (FR-A5)

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: Role;
  v: number; // tokenVersion — invalidates the session when password changes
};

function key(): Uint8Array {
  assertServerEnv();
  return new TextEncoder().encode(env.authSecret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ email: payload.email, role: payload.role, v: payload.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      role: payload.role as Role,
      v: typeof payload.v === "number" ? payload.v : -1,
    };
  } catch {
    return null;
  }
}

export function destroySession(): void {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export const SESSION_COOKIE = COOKIE_NAME;
