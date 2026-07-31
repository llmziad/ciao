// Client-safe avatar helpers (no server-only imports).

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic ICAO-family gradient for an initials avatar. */
export function avatarGradient(seed: string): { from: string; to: string } {
  const palette = [
    { from: "#0072BC", to: "#00B5E2" },
    { from: "#002B5C", to: "#0072BC" },
    { from: "#0072BC", to: "#002B5C" },
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
