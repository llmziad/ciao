import "server-only";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB (FR-E3)
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);
const OUTPUT_SIZE = 512;

export function isAcceptedImage(type: string): boolean {
  return ACCEPTED.has(type);
}

/**
 * Normalizes an uploaded (already client-cropped square) image to a
 * 512x512 WebP. Re-encoding also strips EXIF and neutralizes malformed files.
 */
export async function processProfilePhoto(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // respect EXIF orientation before stripping metadata
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();
}
