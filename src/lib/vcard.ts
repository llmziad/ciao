import type { Profile } from "@prisma/client";

/** Escape per RFC 6350 text value rules. Strips CR to prevent line injection. */
function esc(v: string): string {
  return v
    .replace(/\r/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string): string {
  // vCard lines SHOULD be folded at 75 octets; keep it simple/robust.
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    chunks.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return chunks.join("\r\n");
}

export function buildVCard(profile: Profile, opts?: { photoAbsoluteUrl?: string }): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${esc(profile.name)}`);
  // Structured name: last;first (best-effort split)
  const parts = profile.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.pop()! : "";
  const first = parts.join(" ");
  lines.push(`N:${esc(last)};${esc(first)};;;`);

  if (profile.title) {
    lines.push(`TITLE:${esc(profile.title)}`);
    lines.push(`ORG:ICAO`);
  } else {
    lines.push(`ORG:ICAO`);
  }
  if (profile.phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(profile.phone)}`);
  if (profile.address) lines.push(`ADR;TYPE=WORK:;;${esc(profile.address)};;;;`);

  for (const url of [
    profile.socialInstagram,
    profile.socialTwitter,
    profile.socialFacebook,
    profile.socialLinkedin,
  ]) {
    if (url) lines.push(`URL:${esc(url)}`);
  }

  if (opts?.photoAbsoluteUrl) {
    lines.push(`PHOTO;VALUE=URI:${esc(opts.photoAbsoluteUrl)}`);
  }

  lines.push("END:VCARD");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function vcardFilename(name: string): string {
  const safe = name.trim().replace(/[^\w\s.-]/g, "").replace(/\s+/g, "-") || "contact";
  return `${safe}.vcf`;
}
