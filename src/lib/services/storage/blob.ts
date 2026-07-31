import "server-only";
import { put, del } from "@vercel/blob";
import { env } from "@/lib/env";
import type { StorageService } from "./index";

/** Production storage: Vercel Blob (S3-compatible). */
export class BlobStorage implements StorageService {
  async put(key: string, data: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, data, {
      access: "public",
      contentType,
      token: env.blobToken,
      addRandomSuffix: true,
    });
    return url;
  }

  async remove(url: string): Promise<void> {
    try {
      await del(url, { token: env.blobToken });
    } catch {
      // best-effort
    }
  }
}
