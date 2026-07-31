import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { generateQrSvg, generateQrPng, generateQrPdf } from "@/lib/qr";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: { user: { select: { status: true } } },
  });
  if (!profile || profile.user.status !== "ACTIVE") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = `${env.appUrl}/p/${profile.slug}`;
  const format = (new URL(req.url).searchParams.get("format") || "svg").toLowerCase();
  const download = new URL(req.url).searchParams.get("download") === "1";
  const base = `icao-qr-${profile.slug}`;

  try {
    if (format === "png") {
      const png = await generateQrPng(url);
      return new NextResponse(png, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${base}.png"`,
          "Cache-Control": "no-store",
        },
      });
    }
    if (format === "pdf") {
      const pdf = await generateQrPdf(url);
      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${base}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }
    // svg (default)
    const svg = generateQrSvg(url);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        ...(download ? { "Content-Disposition": `attachment; filename="${base}.svg"` } : {}),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("QR generation failed:", e);
    return new NextResponse("QR generation failed", { status: 500 });
  }
}
