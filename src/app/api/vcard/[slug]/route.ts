import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { buildVCard, vcardFilename } from "@/lib/vcard";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: { user: { select: { status: true } } },
  });
  if (!profile || profile.user.status !== "ACTIVE") {
    return new NextResponse("Not found", { status: 404 });
  }

  const photoAbsoluteUrl = profile.photoUrl
    ? profile.photoUrl.startsWith("http")
      ? profile.photoUrl
      : `${env.appUrl}${profile.photoUrl}`
    : undefined;

  const vcf = buildVCard(profile, { photoAbsoluteUrl });

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcardFilename(profile.name)}"`,
      "Cache-Control": "no-store",
    },
  });
}
