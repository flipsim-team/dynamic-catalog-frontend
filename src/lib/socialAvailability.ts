import type {
  SocialAvailabilityMap,
  SocialPlatform,
  SocialProfile,
} from "./sellerData/types";

const PLATFORMS_NO_WHATSAPP: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "linkedin",
];

export function effectiveWhatsappContactUrl(data: {
  whatsappUrl: string;
  primaryPhone: string;
}): string {
  return (
    data.whatsappUrl ||
    (data.primaryPhone
      ? `https://wa.me/91${data.primaryPhone}?text=${encodeURIComponent(`Hi, I'm interested in your products.`)}`
      : "")
  );
}

/** Resolves per-platform URLs and post availability, matching ContactSidebar fallback semantics. */
export function resolveSocialAvailability(data: {
  socialAvailability?: SocialAvailabilityMap;
  socialProfiles: SocialProfile[];
  whatsappUrl: string;
  primaryPhone: string;
}): SocialAvailabilityMap {
  if (data.socialAvailability) {
    return { ...data.socialAvailability };
  }
  const wa = effectiveWhatsappContactUrl(data);
  const profile = (platform: SocialPlatform) =>
    data.socialProfiles.find((p) => p.platform === platform);

  const base: SocialAvailabilityMap = {
    instagram: { url: "", hasPosts: false },
    facebook: { url: "", hasPosts: false },
    youtube: { url: "", hasPosts: false },
    twitter: { url: "", hasPosts: false },
    linkedin: { url: "", hasPosts: false },
    whatsapp: { url: wa, hasPosts: !!wa },
  };

  for (const platform of PLATFORMS_NO_WHATSAPP) {
    const p = profile(platform);
    base[platform] = {
      url: p?.url || "",
      hasPosts: !!p?.posts?.length,
    };
  }

  return base;
}

/**
 * Heuristic-only WhatsApp detection across seller data.
 * Scans string fields in the provided object for common WhatsApp indicators
 * or phone-like patterns. This is a best-effort client-side hint and
 * NOT a verification.
 */
export function detectWhatsAppHeuristic(data: unknown): boolean {
  const texts: string[] = [];
  const collect = (v: unknown, depth = 0) => {
    if (depth > 6) return; // avoid pathological recursion
    if (v == null) return;
    if (typeof v === "string") {
      texts.push(v);
      return;
    }
    if (typeof v === "number" || typeof v === "boolean") return;
    if (Array.isArray(v)) {
      for (const it of v) collect(it, depth + 1);
      return;
    }
    if (typeof v === "object") {
      for (const val of Object.values(v as Record<string, unknown>)) {
        collect(val, depth + 1);
      }
    }
  };

  try {
    collect(data);
  } catch (e) {
    // swallow
  }

  const combined = texts.join(" ").toLowerCase();
  const waIndicators = [
    "whatsapp",
    "wa.me",
    "wa.link",
    "chat.whatsapp.com",
    "whats-app",
  ];
  for (const ind of waIndicators) if (combined.includes(ind)) return true;

  // loose phone-like pattern: +country or 10+ digits with separators
  const phoneLike = /\+?\d[\d\s\-().]{6,}\d/;
  if (phoneLike.test(combined)) return true;

  return false;
}
