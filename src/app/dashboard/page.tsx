import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/rbac";
import { ensureProfile } from "@/lib/profile";
import { env } from "@/lib/env";
import { ProfileEditor } from "@/components/ProfileEditor";

export default async function DashboardPage() {
  const user = await requireUser();
  // Super admins are administrators only — no personal profile.
  if (user.role === "SUPER_ADMIN") redirect("/dashboard/users");
  const profile = await ensureProfile(user.id, user.email.split("@")[0]);
  const publicUrl = `${env.appUrl}/p/${profile.slug}`;

  return (
    <ProfileEditor
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
  );
}
