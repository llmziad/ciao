import type { SocialNetwork } from "@/lib/socials";

const PATHS: Record<SocialNetwork, { label: string; body: React.ReactNode }> = {
  instagram: {
    label: "Instagram",
    body: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
      </>
    ),
  },
  twitter: {
    label: "Twitter / X",
    body: <path d="M4 4l7 8.5L4.4 20H7l5.2-5.8L16.6 20H20l-7.3-9L19.4 4h-2.6l-4.6 5.2L8 4H4z" fill="currentColor" />,
  },
  facebook: {
    label: "Facebook",
    body: (
      <path
        d="M14 8.5V7c0-.8.5-1 1-1h1.5V3H14c-2.2 0-3.5 1.4-3.5 3.7v1.8H8.5v3H10.5V21H14v-9.5h2.3l.5-3H14z"
        fill="currentColor"
      />
    ),
  },
  linkedin: {
    label: "LinkedIn",
    body: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
        <path
          d="M7 9.5v8M7 6.6v.05M11 17.5v-4.3c0-1.2.8-2 1.9-2s1.9.8 1.9 2v4.3M11 17.5v-8"
          fill="none"
          stroke="#fff"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </>
    ),
  },
};

export function SocialIcon({ network, size = 22 }: { network: SocialNetwork; size?: number }) {
  const s = PATHS[network];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={s.label}>
      {s.body}
    </svg>
  );
}
