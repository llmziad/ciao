import "server-only";
import QRCode from "qrcode";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { icaoMarkDataUri, icaoMarkPngBuffer } from "@/lib/branding";

/**
 * QR generation with a centered ICAO logo (FR-Q).
 *
 * - Error-correction level H (recovers ~30% of the code) so the centered logo
 *   does not break scannability. The logo plate covers ~26% of the width,
 *   well within the H budget, with a white quiet plate around it.
 * - We render modules ourselves for precise control of geometry + overlay.
 */

const DARK = "#002B5C"; // ICAO navy modules on white — high contrast, scannable
const LIGHT = "#FFFFFF";
const QUIET_MODULES = 4; // standard quiet zone
const LOGO_RATIO = 0.22; // logo+plate side relative to QR content width (smaller = more scannable)
const PLATE_PAD_RATIO = 0.08; // white padding inside the plate around the logo
const PLATE_CORNER_RATIO = 0; // 0 = square corners

type Matrix = { size: number; get: (r: number, c: number) => boolean };

function buildMatrix(url: string): Matrix {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const data = qr.modules.data;
  return { size, get: (r, c) => Boolean(data[r * size + c]) };
}

/** Compact SVG path for all dark modules, in a scale=1 module grid. */
function modulesPath(m: Matrix, offset: number): string {
  let d = "";
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (m.get(r, c)) {
        const x = c + offset;
        const y = r + offset;
        d += `M${x} ${y}h1v1h-1z`;
      }
    }
  }
  return d;
}

/** Self-contained SVG string (logo embedded as a data URI). */
export function generateQrSvg(url: string, px = 1024): string {
  const m = buildMatrix(url);
  const total = m.size + QUIET_MODULES * 2;
  const path = modulesPath(m, QUIET_MODULES);

  const plateSide = total * LOGO_RATIO;
  const platePos = (total - plateSide) / 2;
  const plateRadius = plateSide * PLATE_CORNER_RATIO;
  const logoPad = plateSide * PLATE_PAD_RATIO;
  const logoSide = plateSide - logoPad * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">
  <rect width="${total}" height="${total}" fill="${LIGHT}"/>
  <path d="${path}" fill="${DARK}"/>
  <rect x="${platePos}" y="${platePos}" width="${plateSide}" height="${plateSide}" rx="${plateRadius}" ry="${plateRadius}" fill="${LIGHT}"/>
  <image href="${icaoMarkDataUri()}" x="${platePos + logoPad}" y="${platePos + logoPad}" width="${logoSide}" height="${logoSide}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

/**
 * PNG via sharp. To avoid depending on nested-<image> rendering in the SVG
 * rasterizer, we rasterize the QR (shapes only) and the logo separately and
 * composite them.
 */
export async function generateQrPng(url: string, px = 1024): Promise<Buffer> {
  const m = buildMatrix(url);
  const total = m.size + QUIET_MODULES * 2;
  const path = modulesPath(m, QUIET_MODULES);

  const qrOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="${LIGHT}"/><path d="${path}" fill="${DARK}"/></svg>`;

  const plateSidePx = Math.round(px * LOGO_RATIO);
  const padPx = Math.round(plateSidePx * PLATE_PAD_RATIO);
  const radiusPx = Math.round(plateSidePx * PLATE_CORNER_RATIO);
  const logoSidePx = plateSidePx - padPx * 2;

  const plateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${plateSidePx}" height="${plateSidePx}"><rect width="${plateSidePx}" height="${plateSidePx}" rx="${radiusPx}" ry="${radiusPx}" fill="${LIGHT}"/></svg>`;

  const [qrPng, platePng, logoPng] = await Promise.all([
    sharp(Buffer.from(qrOnly)).png().toBuffer(),
    sharp(Buffer.from(plateSvg)).png().toBuffer(),
    sharp(icaoMarkPngBuffer())
      .resize(logoSidePx, logoSidePx, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer(),
  ]);

  const plateWithLogo = await sharp(platePng)
    .composite([{ input: logoPng, gravity: "center" }])
    .png()
    .toBuffer();

  return sharp(qrPng)
    .composite([{ input: plateWithLogo, gravity: "center" }])
    .png()
    .toBuffer();
}

/** PDF sized for a business-card/badge print, QR centered. */
export async function generateQrPdf(url: string, px = 1024): Promise<Buffer> {
  const png = await generateQrPng(url, px);
  const pdf = await PDFDocument.create();
  // 3.5" x 2" business card @ 72pt/in
  const pageW = 252;
  const pageH = 144;
  const page = pdf.addPage([pageW, pageH]);
  const img = await pdf.embedPng(png);
  const qrSize = 120;
  page.drawImage(img, {
    x: (pageW - qrSize) / 2,
    y: (pageH - qrSize) / 2,
    width: qrSize,
    height: qrSize,
  });
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
