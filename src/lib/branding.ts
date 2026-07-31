import "server-only";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Official ICAO logo assets (D9 — written consent confirmed).
 * - icao-logo.png : full horizontal lockup (emblem + "ICAO" wordmark) — headers/UI.
 * - icao-mark.png : roundel emblem only, square — used at the QR center.
 * Extracted from ICAO's official Security Culture resources.
 */
let cachedMarkBuffer: Buffer | null = null;
let cachedMarkDataUri: string | null = null;

export function icaoMarkPngBuffer(): Buffer {
  if (cachedMarkBuffer) return cachedMarkBuffer;
  cachedMarkBuffer = readFileSync(join(process.cwd(), "public", "brand", "icao-mark.png"));
  return cachedMarkBuffer;
}

/** base64 PNG data URI of the ICAO emblem, for embedding into generated SVG. */
export function icaoMarkDataUri(): string {
  if (cachedMarkDataUri) return cachedMarkDataUri;
  cachedMarkDataUri = `data:image/png;base64,${icaoMarkPngBuffer().toString("base64")}`;
  return cachedMarkDataUri;
}
