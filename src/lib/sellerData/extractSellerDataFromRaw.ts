/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  SocialPlatform,
  SourceMeta,
  ContactEntry,
  ProductSourceTile,
  ProductSourceLink,
  ReviewItem,
  SocialPost,
  SocialProfile,
  CatalogProduct,
  ValueWithSources,
} from "./types";
import { sourceLabelFor, toSourceMetaList } from "../sourceLabels";
import { classifySocialPlatformUrl } from "../socialPlatform";
import { buildGoogleMapsUrls } from "./googleMaps";
import { formatCount, formatPrice } from "../formatters";

const PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "linkedin",
];

// Treat only plain objects as expandable record-like values from the raw JSON.
function isObj(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// Read a { value, sources } wrapper when present; otherwise fall back to the provided default.
function unwrapValue<T>(input: unknown, fallback: T): T {
  if (isObj(input) && "value" in input) {
    const value = (input as ValueWithSources<T>).value;
    return (value ?? fallback) as T;
  }
  if (input === undefined || input === null) return fallback;
  return input as T;
}

// Extract source metadata from wrapped values so the UI can explain where data came from.
function unwrapSources(input: unknown): string[] {
  if (
    isObj(input) &&
    Array.isArray((input as ValueWithSources<unknown>).sources)
  ) {
    return ((input as ValueWithSources<unknown>).sources || [])
      .map((s) => String(s))
      .filter(Boolean);
  }
  return [];
}

// Convert phone/email-like arrays into the normalized contact entry shape used by the UI.
function parseContactEntries(
  rawValues: unknown[],
  normalizePhone: boolean,
): ContactEntry[] {
  const entries: ContactEntry[] = [];
  for (const item of rawValues || []) {
    const rawValue = unwrapValue<string>(item, "");
    let value = String(rawValue || "").trim();
    if (!value) continue;
    if (normalizePhone) {
      value = value.replace(/^\+91/, "").replace(/\D/g, "");
      if (!value) continue;
    }
    const role = isObj(item)
      ? String(
          (item as ValueWithSources<string>).role ||
            (item as ValueWithSources<string>).label ||
            (item as ValueWithSources<string>).type ||
            "",
        ).trim()
      : "";
    entries.push({
      value,
      role: role || undefined,
      sources: toSourceMetaList(unwrapSources(item)),
    });
  }
  return entries;
}

// Normalize platform names to the labels shown in badges, cards, and social tabs.
function platformLabel(platform: SocialPlatform | string): string {
  const p = String(platform || "").toLowerCase();
  if (p === "youtube") return "YouTube";
  if (p === "linkedin") return "LinkedIn";
  if (p === "twitter") return "Twitter/X";
  if (p === "whatsapp") return "WhatsApp";
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : "Source";
}

// Fallback label for source URLs when no explicit source name is available.
function hostLabelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return "Website";
    return host;
  } catch {
    return "Website";
  }
}

// Normalize website/catalog source identifiers to the canonical keys used for filtering.
function normalizeWebsiteSource(source: string) {
  const key = String(source || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return key === "catalog" ? "website" : key;
}

// Normalize raw social URL arrays into value/source tuples.
function normalizeSocialUrlEntries(
  rawUrls: unknown[],
): Array<{ value: string; sources: SourceMeta[] }> {
  const out: Array<{ value: string; sources: SourceMeta[] }> = [];
  for (const item of rawUrls || []) {
    const value = String(unwrapValue<string>(item, "") || "").trim();
    if (!value) continue;
    out.push({ value, sources: toSourceMetaList(unwrapSources(item)) });
  }
  return out;
}

// Strip query/hash noise so duplicate URLs collapse to a single canonical key.
function normalizeUrlKey(url: string): string {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    parsed.search = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.protocol = parsed.protocol.toLowerCase();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return trimmed.toLowerCase().replace(/\/$/, "");
  }
}

// Merge duplicate source URL entries while preserving the union of their source metadata.
function mergeSourceEntries(
  entries: Array<{ value: string; sources: SourceMeta[] }>,
): Array<{ value: string; sources: SourceMeta[] }> {
  const merged = new Map<string, { value: string; sources: SourceMeta[] }>();
  for (const entry of entries) {
    const key = normalizeUrlKey(entry.value);
    if (!key) continue;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        value: entry.value,
        sources: [...entry.sources],
      });
      continue;
    }
    const sourceMap = new Map(
      existing.sources.map((source) => [source.key, source]),
    );
    for (const source of entry.sources) {
      sourceMap.set(source.key, source);
    }
    const candidateValue =
      entry.value.length > existing.value.length ? entry.value : existing.value;
    merged.set(key, {
      value: candidateValue,
      sources: Array.from(sourceMap.values()),
    });
  }
  return Array.from(merged.values());
}

// Prefer whichever social URL field appears to be the richer source of truth.
function choosePreferredSocialEntries(
  socialUrls: unknown[],
  social: unknown,
): Array<{ value: string; sources: SourceMeta[] }> {
  const socialUrlEntries = normalizeSocialUrlEntries(socialUrls);
  const socialEntries = normalizeSocialUrlEntries(
    Array.isArray(social) ? social : [],
  );
  const preferred =
    socialEntries.length > socialUrlEntries.length
      ? socialEntries
      : socialUrlEntries;
  return mergeSourceEntries(preferred);
}

function classifyUrl(url: string): SocialPlatform | null {
  // Reuse the generic platform classifier so extractor and UI stay aligned.
  return classifySocialPlatformUrl(url);
}

export function extractYouTubeId(url: string): string {
  // Pull a stable YouTube id from the common URL formats we see in raw data.
  if (!url) return "";
  if (url.includes("shorts/"))
    return url.split("shorts/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("youtu.be/"))
    return url.split("youtu.be/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("embed/"))
    return url.split("embed/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("live/"))
    return url.split("live/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0] || "";
  return "";
}

// Convert raw social post objects into the normalized post shape used by the UI.
function normalizePost(
  raw: any,
  platform: SocialPlatform,
  idx: number,
): SocialPost {
  return {
    id: raw.post_url || `${platform}-${idx}`,
    platform,
    type: raw.type || "post",
    url: raw.post_url || "",
    thumbnailUrl: raw.thumbnail_url || "",
    caption: raw.caption || "",
    likes: raw.likes || 0,
    comments: raw.comments || 0,
    views: raw.views ?? null,
    postedAt: raw.posted_at || "",
  };
}

// Remove duplicate URLs while preserving the first observed display value.
function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const url of urls) {
    const key = normalizeUrlKey(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(url);
  }
  return deduped;
}

// Transform the raw seller payload into the typed seller data shape consumed by the app.
export function extractSellerDataFromRaw(rawData: unknown) {
  const data = (rawData ?? {}) as any;
  const cp = data.company_profile || {};
  const sellerId = String(data.seller_id || "");
  const sellerName = String(unwrapValue(cp.name, "Seller") || "Seller");
  const phoneEntries = parseContactEntries(cp.phones || [], true);
  const emailEntries = parseContactEntries(cp.emails || [], false);
  const phones: string[] = phoneEntries.map((p) => p.value);
  const emails: string[] = emailEntries.map((e) => e.value);
  const primaryPhone = phones[0] || "";
  const email = emails[0] || "";
  const fullAddress = String(unwrapValue(cp.address, "") || "");
  const city = String(unwrapValue(cp.city, "") || "");
  const website = String(unwrapValue(cp.website, "") || "");
  const businessType = String(unwrapValue(cp.business_type, "") || "");
  const googleLocation = String(unwrapValue(cp.google_location, "") || "");
  const gmbLudocid = String(unwrapValue(cp.gmb_ludocid, "") || "");
  const rawRatingValue = unwrapValue<number | string | null>(
    cp.rating_value,
    null,
  );
  const ratingValue =
    typeof rawRatingValue === "number"
      ? rawRatingValue
      : rawRatingValue
        ? parseFloat(String(rawRatingValue))
        : null;
  const ratingCount = Number(unwrapValue(cp.rating_count, 0) || 0);
  const description = String(unwrapValue(cp.description, "") || "");
  const reviewsUrl = String(
    unwrapValue(cp.reviews_url, "") ||
      data.reviews_url ||
      cp.reviews_api_url ||
      data.reviews_api_url ||
      data.reviews_summary?.reviews_url ||
      "",
  );
  const resolvedMaps = buildGoogleMapsUrls({
    googleLocation,
    gmbLudocid,
    reviewsUrl,
    fullAddress,
    city,
    sellerName,
  });
  const fieldSources = {
    phone: Array.from(
      new Map(
        phoneEntries
          .flatMap((entry) => entry.sources)
          .map((source) => [source.key, source]),
      ).values(),
    ),
    email: Array.from(
      new Map(
        emailEntries
          .flatMap((entry) => entry.sources)
          .map((source) => [source.key, source]),
      ).values(),
    ),
    website: toSourceMetaList(unwrapSources(cp.website)),
    address: toSourceMetaList(unwrapSources(cp.address)),
    city: toSourceMetaList(unwrapSources(cp.city)),
    rating: toSourceMetaList(unwrapSources(cp.rating_value)),
    businessType: toSourceMetaList(unwrapSources(cp.business_type)),
  };

  // Ensure special sign3 evidence is reflected in contact sources when present
  const addSourceIfMissing = (arr: SourceMeta[], key: string) => {
    if (!arr.some((s) => s.key === key))
      arr.push({ key, label: sourceLabelFor(key) });
  };
  if (cp?.sign3_verified_phone) addSourceIfMissing(fieldSources.phone, "sign3");
  if (cp?.sign3_verified_email) addSourceIfMissing(fieldSources.email, "sign3");
  if (cp?.sign3_verified) {
    // if broadly verified, ensure sign3 appears in common contact fields
    addSourceIfMissing(fieldSources.phone, "sign3");
    addSourceIfMissing(fieldSources.email, "sign3");
    addSourceIfMissing(fieldSources.address, "sign3");
    addSourceIfMissing(fieldSources.city, "sign3");
  }

  // Build authoritative social profile list (one per platform)
  const profilesByPlatform: Record<string, SocialProfile> = {};
  const rawProfiles = data.social_profiles || [];
  for (const p of rawProfiles) {
    const platform = (p.platform || "").toLowerCase() as SocialPlatform;
    if (!PLATFORMS.includes(platform)) continue;
    if (!p.url) continue;
    const profile: SocialProfile = {
      platform,
      url: p.url,
      profilePic: p.profile_pic_url || "",
      bannerUrl: p.banner_url || "",
      bio: p.bio || "",
      followers: typeof p.followers_count === "number" ? p.followers_count : 0,
      posts: (p.posts || []).map((rp: any, i: number) =>
        normalizePost(rp, platform, i),
      ),
    };
    // Sort posts by postedAt desc, top 6
    profile.posts.sort(
      (a, b) =>
        new Date(b.postedAt || 0).getTime() -
        new Date(a.postedAt || 0).getTime(),
    );
    profile.posts = profile.posts.slice(0, 6);
    profilesByPlatform[platform] = profile;
  }

  // Augment with social_urls (fallback for platforms missing in social_profiles)
  const socialUrlEntries = choosePreferredSocialEntries(
    [...(cp.social_urls || [])],
    cp.social,
  );

  // Include explicit platform URLs under company_profile (facebook, instagram, etc.)
  for (const platform of PLATFORMS) {
    const value = String(unwrapValue(cp[platform], "") || "");
    if (!value) continue;
    socialUrlEntries.push({
      value,
      sources: toSourceMetaList(unwrapSources(cp[platform])),
    });
  }

  const dedupSocialUrls: Array<{ value: string; sources: SourceMeta[] }> = [];
  const seenSocialUrl = new Set<string>();
  for (const entry of socialUrlEntries) {
    const key = normalizeUrlKey(entry.value);
    if (seenSocialUrl.has(key)) continue;
    seenSocialUrl.add(key);
    dedupSocialUrls.push(entry);
  }

  for (const item of dedupSocialUrls) {
    const platform = classifyUrl(item.value);
    if (!platform || platform === "whatsapp") continue;
    if (!profilesByPlatform[platform]) {
      profilesByPlatform[platform] = {
        platform,
        url: item.value,
        profilePic: "",
        bannerUrl: "",
        bio: "",
        followers: 0,
        posts: [],
      };
    }
  }

  const socialProfiles = Object.values(profilesByPlatform);

  const whatsappEntry = dedupSocialUrls.find((u) =>
    /wa\.me|whatsapp/i.test(u.value),
  );
  const whatsappUrl = whatsappEntry?.value || "";

  // Banner / Avatar priority
  const yt = profilesByPlatform.youtube;
  const fb = profilesByPlatform.facebook;
  const ig = profilesByPlatform.instagram;
  const bannerUrl = yt?.bannerUrl || fb?.bannerUrl || "";
  const avatarCandidates = dedupeUrls(
    [
      String(unwrapValue(cp.logo_url, "") || ""),
      ig?.profilePic || "",
      fb?.profilePic || "",
      yt?.profilePic || "",
    ].filter(Boolean),
  );
  const avatarUrl = avatarCandidates[0] || "";

  // Tagline (used by hero/footer)
  const tagline = description || yt?.bio || ig?.bio || fb?.bio || "";

  // Products from catalog_items
  const catalogItems = data.catalog_items || data.products || [];

  const products: CatalogProduct[] = catalogItems
    .filter((c: any) => c.clean_name)
    .map((c: any, i: number) => {
      const catalogSourceKeys = (Array.isArray(c.sources) ? c.sources : []).map(
        (s: any) => normalizeWebsiteSource(String(s)),
      );
      const sourceTiles: ProductSourceTile[] =
        toSourceMetaList(catalogSourceKeys);
      const sourceLinks: ProductSourceLink[] = [];
      const pushLink = (link: ProductSourceLink) => {
        if (!link.url) return;
        sourceLinks.push(link);
      };

      // Collect social source URLs first to avoid duplicates with source_url
      const socialSourceUrls = new Set<string>();
      for (const socialSource of Array.isArray(c.social_sources)
        ? c.social_sources
        : []) {
        const platform = String(
          socialSource.platform ||
            classifyUrl(socialSource.post_url || "") ||
            "",
        ).toLowerCase() as SocialPlatform;
        const url = String(socialSource.post_url || socialSource.url || "");
        if (!url) continue;
        socialSourceUrls.add(normalizeUrlKey(url));
        if (platform) {
          sourceTiles.push({ key: platform, label: platformLabel(platform) });
          pushLink({
            key: `${platform}-${url}`,
            label: platformLabel(platform),
            url,
            platform,
          });
        } else {
          pushLink({ key: `source-${url}`, label: hostLabelFromUrl(url), url });
        }
      }

      // Only add source_url if it's not already in social_sources
      const sourceUrl = String(
        c.source_url || c.specifications?.source_url || "",
      );
      if (sourceUrl && !socialSourceUrls.has(normalizeUrlKey(sourceUrl))) {
        pushLink({
          key: "catalog-source",
          label: c.source
            ? sourceLabelFor(c.source)
            : hostLabelFromUrl(sourceUrl),
          url: sourceUrl,
        });
      }

      const seenTile = new Set<string>();
      const dedupTiles = sourceTiles.filter((tile) => {
        const key = `${tile.key}:${tile.label}`;
        if (seenTile.has(key)) return false;
        seenTile.add(key);
        return true;
      });

      const seenLink = new Set<string>();
      const dedupLinks = sourceLinks.filter((link) => {
        const key = `${link.label}:${normalizeUrlKey(link.url)}`;
        if (seenLink.has(key)) return false;
        seenLink.add(key);
        return true;
      });

      return {
        id: c.fingerprint || String(i),
        name: c.clean_name,
        description: c.description || "",
        category: c.product_category || "Other",
        subType: c.product_sub_type || "",
        domain: c.top_level_domain || "",
        segment: c.industry_segment || "",
        buyerPersona: c.buyer_persona || "",
        tags: Array.isArray(c.tags) ? c.tags : [],
        brand: c.b2b_attributes?.brand || "",
        hsnCode: c.b2b_attributes?.hsn_code || "",
        gstPercent: c.b2b_attributes?.gst_percent ?? null,
        countryOfOrigin: c.b2b_attributes?.country_of_origin || "",
        certifications: c.b2b_attributes?.certifications || [],
        moq: c.b2b_attributes?.moq ?? null,
        moqUnit: c.b2b_attributes?.moq_unit || "",
        priceUnit: c.b2b_attributes?.price_unit || c.price_unit || "",
        priceSingle: c.price_single ?? null,
        priceMin: c.price_min ?? null,
        priceMax: c.price_max ?? null,
        isPriceRange: !!c.is_price_range,
        priceOnRequest: !!c.price_on_request,
        currency: c.currency || "INR",
        primaryPhoto: c.primary_photo_url || c.photo_urls?.[0] || "",
        photos: (c.photo_urls || []).filter(Boolean),
        inStock: c.in_stock !== false,
        // sourceUrl,
        source: c.source ? normalizeWebsiteSource(c.source) : "",
        sourceTiles: dedupTiles,
        sourceLinks: dedupLinks,
        specifications: c.specifications || {},
      };
    });

  // Categories (unique with counts)
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Gallery images (deduped)
  const galleryImages: { url: string; source: string; caption?: string }[] = [];
  const seen = new Set<string>();
  const addImg = (url: string, source: string, caption?: string) => {
    const key = normalizeUrlKey(url);
    if (!key || seen.has(key)) return;
    seen.add(key);
    galleryImages.push({ url, source, caption });
  };
  products.forEach((p) => {
    addImg(p.primaryPhoto, (p.source || "Website").toUpperCase(), p.name);
    p.photos.forEach((ph) =>
      addImg(ph, (p.source || "Website").toUpperCase(), p.name),
    );
  });
  (data.media_assets || []).forEach((m: any) =>
    addImg(m.url, "Website", m.product_name),
  );
  ig?.posts.forEach((p) => addImg(p.thumbnailUrl, "INSTAGRAM", p.caption));
  yt?.posts.forEach((p) => addImg(p.thumbnailUrl, "YOUTUBE", p.caption));

  // Reviews summary
  const rs = data.reviews_summary || {};
  // Force reviews to be treated as Google-sourced.
  // Extract any available reviews URL from common fields so the UI can link back.
  const reviewSourceMap: Record<string, number> = {};
  const reviewsSummary = {
    totalRating: rs.total_rating ?? ratingValue ?? null,
    noOfRatings: rs.no_of_ratings ?? ratingCount ?? 0,
    ratingComments: rs.rating_comments || [],
    sourceBreakdown: {} as Record<string, number>,
  };
  const individualReviews: ReviewItem[] = (data.reviews || []).map((r: any) => {
    // Hardcode source to google for all reviews/ratings
    const sourceKey = "google";
    reviewSourceMap[sourceKey] = (reviewSourceMap[sourceKey] || 0) + 1;
    return {
      author: r.author || r.name || "Anonymous",
      rating: r.rating || 0,
      text: r.text || r.comment || "",
      date: r.date || r.posted_at || "",
      sourceKey,
      sourceLabel: sourceLabelFor(sourceKey),
      sourceUrl: reviewsUrl || undefined,
    };
  });
  // Make breakdown only reflect Google as the source
  if (reviewSourceMap.google)
    reviewsSummary.sourceBreakdown = { google: reviewSourceMap.google };
  else reviewsSummary.sourceBreakdown = {};

  // Product counts (showcased vs total)
  const totalProducts = data.products?.length || products.length;
  const showcasedItems = products.length;

  // Highest follower count across platforms
  const topFollowers = socialProfiles.reduce(
    (max, p) => Math.max(max, p.followers || 0),
    0,
  );
  const topFollowerProfile = socialProfiles.reduce<SocialProfile | null>(
    (best, p) => (p.followers > (best?.followers || 0) ? p : best),
    null,
  );
  const topPlatformLabel = topFollowerProfile
    ? topFollowerProfile.platform.charAt(0).toUpperCase() +
      topFollowerProfile.platform.slice(1)
    : "";

  // Trust badges per spec (no marketplace affiliation)
  const trustBadges: {
    label: string;
    icon: string;
    url?: string;
    scrollTo?: string;
    tooltip?: string;
  }[] = [];
  if (ratingValue && reviewsSummary.noOfRatings > 0) {
    trustBadges.push({
      label: `${ratingValue.toFixed(1)}★ Rated`,
      icon: "award",
      scrollTo: "reviews",
    });
    trustBadges.push({
      label: `${reviewsSummary.noOfRatings} Reviews`,
      icon: "file-check",
      scrollTo: "reviews",
    });
  }
  if (city) {
    trustBadges.push({
      label: city,
      icon: "map-pin",
      url: googleLocation || undefined,
      scrollTo: googleLocation ? undefined : "contact",
    });
  }
  if (businessType) {
    trustBadges.push({
      label: businessType,
      icon: "factory",
      scrollTo: "about",
    });
  }
  if (showcasedItems > 0) {
    const productLabel = `Showing ${showcasedItems} products`;
    trustBadges.push({
      label: productLabel,
      icon: "package",
      scrollTo: "products",
      tooltip: `Data available for ${showcasedItems} of ${totalProducts} catalog products.`,
    });
  }
  if (topFollowers > 0 && topPlatformLabel) {
    trustBadges.push({
      label: `${formatCount(topFollowers)} ${topPlatformLabel} Followers`,
      icon: "verified",
      scrollTo: "social",
      url: topFollowerProfile?.url,
    });
  }
  if (website) {
    trustBadges.push({ label: "Visit Website", icon: "globe", url: website });
  }

  const socialAvailability: Record<
    SocialPlatform,
    { url: string; hasPosts: boolean }
  > = {
    instagram: { url: "", hasPosts: false },
    facebook: { url: "", hasPosts: false },
    youtube: { url: "", hasPosts: false },
    twitter: { url: "", hasPosts: false },
    linkedin: { url: "", hasPosts: false },
    whatsapp: { url: whatsappUrl, hasPosts: !!whatsappUrl },
  };
  for (const platform of PLATFORMS) {
    const profile = profilesByPlatform[platform];
    socialAvailability[platform] = {
      url: profile?.url || "",
      hasPosts: !!profile?.posts?.length,
    };
  }

  return {
    sellerId,
    sellerName,
    tagline,
    description,
    businessType,
    phones,
    phoneEntries,
    primaryPhone,
    emails,
    emailEntries,
    email,
    fullAddress,
    city,
    website,
    googleLocation: resolvedMaps.mapUrl,
    googleMapsUrl: resolvedMaps.mapUrl,
    googleMapsEmbedUrl: resolvedMaps.embedUrl,
    googleMapsSource: resolvedMaps.source,
    ratingValue,
    ratingCount,
    avatarUrl,
    avatarCandidates,
    bannerUrl,
    whatsappUrl,
    socialProfiles,
    socialUrls: dedupSocialUrls,
    products,
    totalProducts,
    showcasedItems,
    categories,
    galleryImages,
    reviewsSummary,
    individualReviews,
    reviewsUrl,
    fieldSources,
    trustBadges,
    topFollowers,
    topPlatformLabel,
    socialAvailability,
    contactSources: {
      primaryPhone: fieldSources.phone,
      email: fieldSources.email,
      website: fieldSources.website,
      address: fieldSources.address,
      city: fieldSources.city,
      whatsapp: whatsappEntry?.sources || [],
      contactCta: [
        ...(whatsappEntry?.sources || []),
        ...fieldSources.phone,
        ...fieldSources.email,
      ].filter((v, idx, arr) => arr.findIndex((x) => x.key === v.key) === idx),
    },
  };
}

export function extractSellerData(rawData: unknown) {
  return extractSellerDataFromRaw(rawData);
}

export type SellerData = ReturnType<typeof extractSellerDataFromRaw>;
