import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { SocialIcon } from "@/components/SocialIcon";
import { PhoneIcon, MapPinIcon, DownloadIcon, ChevronRightIcon } from "@/components/Icons";
import type { SocialNetwork } from "@/lib/socials";

export const dynamic = "force-dynamic";

async function getVisibleProfile(slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { user: { select: { status: true } } },
  });
  if (!profile || profile.user.status !== "ACTIVE") return null;
  return profile;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getVisibleProfile(params.slug);
  if (!profile) return { title: "Profile unavailable · ICAO" };
  return {
    title: `${profile.name}${profile.title ? ` · ${profile.title}` : ""} · ICAO`,
    description: `Official ICAO digital profile for ${profile.name}.`,
  };
}

function AppBar() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/icao-logo.png" alt="ICAO" className="h-7 w-auto" />
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-icao-navy">
          Digital Identity
        </span>
      </div>
    </header>
  );
}

function Unavailable() {
  return (
    <main className="min-h-screen bg-bg">
      <AppBar />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-xl font-semibold text-icao-navy">Profile unavailable</h1>
        <p className="mt-2 text-sm text-muted">
          This profile doesn&apos;t exist or is no longer active.
        </p>
      </div>
    </main>
  );
}

function ContactRow({
  href,
  external,
  icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3.5 px-6 py-4 transition-colors hover:bg-bg"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-icao-blue">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <span className="block truncate font-medium text-ink">{value}</span>
      </span>
      <ChevronRightIcon className="shrink-0 text-line" />
    </a>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getVisibleProfile(params.slug);
  if (!profile) return <Unavailable />;

  const telHref = profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, "")}` : null;
  const mapHref = profile.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`
    : null;

  const socialEntries: { network: SocialNetwork; url: string | null }[] = [
    { network: "linkedin", url: profile.socialLinkedin },
    { network: "twitter", url: profile.socialTwitter },
    { network: "instagram", url: profile.socialInstagram },
    { network: "facebook", url: profile.socialFacebook },
  ];
  const socials = socialEntries.filter(
    (s): s is { network: SocialNetwork; url: string } => Boolean(s.url),
  );
  const hasContact = Boolean(telHref || mapHref);

  return (
    <main className="min-h-screen bg-bg">
      <AppBar />

      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <article className="card overflow-hidden">
          {/* Identity */}
          <div className="flex flex-col items-center px-6 pt-9 text-center">
            <div className="rounded-full ring-1 ring-line">
              <Avatar name={profile.name} photoUrl={profile.photoUrl} size={104} />
            </div>
            <h1 className="mt-5 font-display text-[26px] font-semibold leading-tight text-icao-navy">
              {profile.name}
            </h1>
            {profile.title && <p className="mt-1.5 text-[15px] text-muted">{profile.title}</p>}
            <span className="mt-4 rounded-full bg-icao-blue/10 px-3.5 py-1.5 text-xs font-semibold text-icao-blue">
              International Civil Aviation Organization
            </span>
          </div>

          {/* Primary action */}
          <div className="px-6 pt-6">
            <a
              href={`/api/vcard/${profile.slug}`}
              className="btn-primary w-full gap-2"
              aria-label="Save this contact to your phone"
            >
              <DownloadIcon size={18} />
              Save to contact
            </a>
          </div>

          {/* Contact details */}
          {hasContact && (
            <div className="mt-6 divide-y divide-line border-t border-line">
              {telHref && (
                <ContactRow
                  href={telHref}
                  icon={<PhoneIcon size={18} />}
                  label="Phone"
                  value={profile.phone!}
                />
              )}
              {mapHref && (
                <ContactRow
                  href={mapHref}
                  external
                  icon={<MapPinIcon size={18} />}
                  label="Address"
                  value={profile.address!}
                />
              )}
            </div>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <div className="border-t border-line px-6 py-6">
              <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Connect
              </p>
              <div className="flex items-center justify-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.network}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-icao-navy transition-colors hover:border-icao-navy hover:bg-icao-navy hover:text-white"
                    aria-label={s.network}
                  >
                    <SocialIcon network={s.network} size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
          Official digital identity · International Civil Aviation Organization
          <br />© {new Date().getFullYear()} ICAO
        </p>
      </div>
    </main>
  );
}
