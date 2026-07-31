/**
 * Normalize social inputs: accept either a full URL or a bare handle and
 * return a canonical profile URL. Returns null for empty input, throws on
 * an obviously invalid/mismatched value.
 */

export type SocialNetwork = "instagram" | "twitter" | "facebook" | "linkedin";

const BASE: Record<SocialNetwork, string> = {
  instagram: "https://instagram.com/",
  twitter: "https://x.com/",
  facebook: "https://facebook.com/",
  linkedin: "https://linkedin.com/in/",
};

const HOSTS: Record<SocialNetwork, string[]> = {
  instagram: ["instagram.com"],
  twitter: ["twitter.com", "x.com"],
  facebook: ["facebook.com", "fb.com", "m.facebook.com"],
  linkedin: ["linkedin.com"],
};

export function normalizeSocial(network: SocialNetwork, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // Treat as a URL if it has a scheme, mentions a known host, or looks like
  // "domain.tld/path" without a scheme. Otherwise it's a bare username/handle.
  const hasScheme = /^https?:\/\//i.test(value);
  const mentionsHost = HOSTS[network].some((h) => value.toLowerCase().includes(h));
  const looksLikeDomainPath = /^[\w-]+(\.[\w-]+)+\/\S*/.test(value);

  if (hasScheme || mentionsHost || looksLikeDomainPath) {
    const candidate = hasScheme ? value : `https://${value}`;
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      throw new Error(`That doesn't look like a valid ${network} link.`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`That doesn't look like a valid ${network} link.`);
    }
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!HOSTS[network].some((h) => host === h || host.endsWith(`.${h}`))) {
      throw new Error(`That doesn't look like a ${network} link.`);
    }
    return url.toString();
  }

  // Bare handle/username — prepend the network's base URL.
  const handle = value.replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]+$/.test(handle)) {
    throw new Error(`Enter a valid ${network} username or full URL.`);
  }
  return BASE[network] + handle;
}
