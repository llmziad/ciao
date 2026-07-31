import { avatarGradient, initials } from "@/lib/avatar";

/** Circular avatar: photo if present, else a branded initials fallback (D6). */
export function Avatar({
  name,
  photoUrl,
  size = 96,
  className = "",
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const dim = { width: size, height: size };
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={dim}
        className={`rounded-full object-cover ring-2 ring-white shadow-card ${className}`}
      />
    );
  }
  const g = avatarGradient(name);
  return (
    <div
      style={{ ...dim, background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
      className={`flex items-center justify-center rounded-full font-display font-semibold text-white ring-2 ring-white shadow-card ${className}`}
      aria-label={name}
    >
      <span style={{ fontSize: size * 0.36 }}>{initials(name)}</span>
    </div>
  );
}
