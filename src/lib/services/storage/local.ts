import "server-only";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import type { StorageService } from "./index";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/** Dev storage: writes to public/uploads, served statically at /uploads/*. */
export class LocalStorage implements StorageService {
  async put(key: string, data: Buffer): Promise<string> {
    const safeKey = key.replace(/[^\w./-]/g, "_").replace(/\.\.+/g, ".");
    const filePath = join(UPLOAD_DIR, safeKey);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, data);
    return `/uploads/${safeKey}`;
  }

  async remove(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const rel = url.slice("/uploads/".length);
    try {
      await unlink(join(UPLOAD_DIR, rel));
    } catch {
      // already gone — ignore
    }
  }
}
