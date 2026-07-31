/**
 * Centralized environment access with safe defaults.
 * Server-only secrets must never be read from client components.
 */

export const env = {
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  authSecret: process.env.AUTH_SECRET || "",
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || "",
  isProd: process.env.NODE_ENV === "production",
};

/** Fail fast in server contexts if a required secret is missing. */
export function assertServerEnv() {
  if (!env.authSecret || env.authSecret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a 32+ char random string in .env.local.",
    );
  }
}
