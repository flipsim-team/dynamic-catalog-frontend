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
