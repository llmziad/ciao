import "server-only";
import sharp from "sharp";
import { MAX_UPLOAD_BYTES, ACCEPTED_IMAGE_TYPES } from "@/lib/upload";

export { MAX_UPLOAD_BYTES };
const ACCEPTED = new Set(ACCEPTED_IMAGE_TYPES);
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
