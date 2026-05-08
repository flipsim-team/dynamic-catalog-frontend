import type { SocialPlatform } from "./sellerData/types";

/**
 * Detects social platform from a URL (absolute or partial).
 * Uses URL parsing when possible, with substring fallback for non-URL strings.
 */
export function classifySocialPlatformUrl(url: string): SocialPlatform | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host.includes("fb.com"))
      return "facebook";
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "youtube";
    if (host.includes("twitter.com") || host.includes("x.com"))
      return "twitter";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("wa.me") || host.includes("whatsapp.com"))
      return "whatsapp";
    return null;
  } catch {
    const u = url.toLowerCase();
    if (u.includes("instagram.com")) return "instagram";
    if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes("twitter.com") || u.includes("x.com/")) return "twitter";
    if (u.includes("linkedin.com")) return "linkedin";
    if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
    return null;
  }
}
