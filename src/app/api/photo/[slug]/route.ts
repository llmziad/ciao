import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Serves a profile's photo bytes from the database. */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    select: { photoData: true, photoMime: true, user: { select: { status: true } } },
  });

  if (!profile || profile.user.status !== "ACTIVE" || !profile.photoData) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(Buffer.from(profile.photoData), {
    headers: {
      "Content-Type": profile.photoMime || "image/webp",
      // Content is immutable per ?v= cache-buster set at upload time.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
