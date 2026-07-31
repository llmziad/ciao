import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/lib/profile";
import { env } from "@/lib/env";
import { ProfileEditor } from "@/components/ProfileEditor";

export default async function EditUserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  await requireSuperAdmin();
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) notFound();

  const profile = await ensureProfile(user.id, user.email.split("@")[0]);
  const publicUrl = `${env.appUrl}/p/${profile.slug}`;

  return (
    <div className="space-y-4">
      <Link href="/dashboard/users" className="text-sm font-medium text-icao-blue hover:underline">
        ← Back to users
      </Link>
      <ProfileEditor
        heading={`Editing ${user.email}`}
        profile={{
          userId: user.id,
          slug: profile.slug,
          name: profile.name,
          title: profile.title,
          phone: profile.phone,
          address: profile.address,
          photoUrl: profile.photoUrl,
          socialInstagram: profile.socialInstagram,
          socialTwitter: profile.socialTwitter,
          socialFacebook: profile.socialFacebook,
          socialLinkedin: profile.socialLinkedin,
        }}
        publicUrl={publicUrl}
      />
    </div>
  );
}
