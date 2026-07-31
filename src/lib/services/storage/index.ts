import "server-only";
import { env } from "@/lib/env";
import { LocalStorage } from "./local";
import { BlobStorage } from "./blob";

/**
 * StorageService — provider-agnostic (D11). Local filesystem in dev
 * (public/uploads), Vercel Blob in production. Swappable for R2/MinIO later
 * if ICAO requires data residency.
 */
export interface StorageService {
  /** Stores bytes and returns a public URL. `key` is a stable path hint. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  /** Best-effort delete by the URL previously returned from put(). */
  remove(url: string): Promise<void>;
}

let instance: StorageService | null = null;

export function storageService(): StorageService {
  if (instance) return instance;
  instance = env.blobToken ? new BlobStorage() : new LocalStorage();
  return instance;
}

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extForImage(contentType: string): string | null {
  return IMAGE_EXT[contentType] ?? null;
}
