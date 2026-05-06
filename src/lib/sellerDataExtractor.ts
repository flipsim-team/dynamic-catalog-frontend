/* eslint-disable @typescript-eslint/no-explicit-any */

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "twitter"
  | "linkedin"
  | "whatsapp";

interface ValueWithSources<T> {
  value?: T;
  sources?: string[];
  role?: string;
  label?: string;
  type?: string;
}

export interface SourceMeta {
  key: string;
  label: string;
}

export interface ContactEntry {
  value: string;
  role?: string;
  sources: SourceMeta[];
}

export interface ProductSourceTile {
  key: string;
  label: string;
}

export interface ProductSourceLink {
  key: string;
  label: string;
  url: string;
  platform?: SocialPlatform;
}

export interface ReviewItem {
  author: string;
  rating: number;
  text: string;
  date: string;
  sourceKey: string;
  sourceLabel: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  type: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  likes: number;
  comments: number;
  views: number | null;
  postedAt: string;
}

export interface SocialProfile {
  platform: SocialPlatform;
  url: string;
  profilePic: string;
  bannerUrl: string;
  bio: string;
  followers: number;
  posts: SocialPost[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subType: string;
  domain: string;
  segment: string;
  buyerPersona: string;
  tags: string[];
  brand: string;
  hsnCode: string;
  gstPercent: number | null;
  countryOfOrigin: string;
  certifications: string[];
  moq: number | null;
  moqUnit: string;
  priceUnit: string;
  priceSingle: number | null;
  priceMin: number | null;
  priceMax: number | null;
  isPriceRange: boolean;
  priceOnRequest: boolean;
  currency: string;
  primaryPhoto: string;
  photos: string[];
  inStock: boolean;
  sourceUrl: string;
  source: string;
  sourceTiles: ProductSourceTile[];
  sourceLinks: ProductSourceLink[];
  specifications: Record<string, string | number>;
}

const PLATFORMS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "linkedin",
];

function isObj(v: unknown): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function unwrapValue<T>(input: unknown, fallback: T): T {
  if (isObj(input) && "value" in input) {
    const value = (input as ValueWithSources<T>).value;
    return (value ?? fallback) as T;
  }
  if (input === undefined || input === null) return fallback;
  return input as T;
}

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

function sourceLabelFor(source: string): string {
  const key = String(source || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const map: Record<string, string> = {
    website: "Website",
    gst: "GST",
    google: "Google",
    youtube: "YouTube",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
    x: "Twitter/X",
    shiva_enriched: "Shiva Enriched",
    llm_generated: "LLM Generated",
    justdial: "Justdial",
    whatsapp: "WhatsApp",
  };
  if (map[key]) return map[key];
  if (!key) return "Unknown";
  return key
    .split(/[_-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function toSourceMetaList(rawSources: string[]): SourceMeta[] {
  const seen = new Set<string>();
  const out: SourceMeta[] = [];
  for (const raw of rawSources) {
    const key = String(raw || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, label: sourceLabelFor(key) });
  }
  return out;
}

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

function platformLabel(platform: SocialPlatform | string): string {
  const p = String(platform || "").toLowerCase();
  if (p === "youtube") return "YouTube";
  if (p === "linkedin") return "LinkedIn";
  if (p === "twitter") return "Twitter/X";
  if (p === "whatsapp") return "WhatsApp";
  return p ? p.charAt(0).toUpperCase() + p.slice(1) : "Source";
}

function hostLabelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return "Website";
    return host;
  } catch {
    return "Website";
  }
}

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
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("twitter.com") || u.includes("x.com/")) return "twitter";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  return null;
}

export function extractYouTubeId(url: string): string {
  if (!url) return "";
  if (url.includes("shorts/"))
    return url.split("shorts/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("youtu.be/"))
    return url.split("youtu.be/")[1]?.split(/[?&#]/)[0] || "";
  if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0] || "";
  return "";
}

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
  const avatarUrl =
    data.company_profile?.logo_url ||
    ig?.profilePic ||
    yt?.profilePic ||
    fb?.profilePic ||
    "";

  // Tagline (used by hero/footer)
  const tagline = description || yt?.bio || ig?.bio || fb?.bio || "";

  // Products from catalog_items
  const catalogItems = data.catalog_items || data.products || [];

  const products: CatalogProduct[] = catalogItems
    .filter((c: any) => c.clean_name)
    .map((c: any, i: number) => {
      const catalogSourceKeys = (Array.isArray(c.sources) ? c.sources : []).map(
        (s: any) => String(s).toLowerCase(),
      );
      const sourceTiles: ProductSourceTile[] =
        toSourceMetaList(catalogSourceKeys);
      const sourceLinks: ProductSourceLink[] = [];
      const pushLink = (link: ProductSourceLink) => {
        if (!link.url) return;
        sourceLinks.push(link);
      };

      const sourceUrl = String(
        c.source_url || c.specifications?.source_url || "",
      );
      if (sourceUrl) {
        pushLink({
          key: "catalog-source",
          label: c.source ? String(c.source) : hostLabelFromUrl(sourceUrl),
          url: sourceUrl,
        });
      }

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
        source: c.source || "",
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
    addImg(p.primaryPhoto, (p.source || "Catalog").toUpperCase(), p.name);
    p.photos.forEach((ph) =>
      addImg(ph, (p.source || "Catalog").toUpperCase(), p.name),
    );
  });
  (data.media_assets || []).forEach((m: any) =>
    addImg(m.url, "Catalog", m.product_name),
  );
  ig?.posts.forEach((p) => addImg(p.thumbnailUrl, "INSTAGRAM", p.caption));
  yt?.posts.forEach((p) => addImg(p.thumbnailUrl, "YOUTUBE", p.caption));

  // Reviews summary
  const rs = data.reviews_summary || {};
  const defaultReviewSource =
    cp.reviews_api_url && String(cp.reviews_api_url).includes("google_maps")
      ? "google"
      : "website";
  const reviewSourceMap: Record<string, number> = {};
  const reviewsSummary = {
    totalRating: rs.total_rating ?? ratingValue ?? null,
    noOfRatings: rs.no_of_ratings ?? ratingCount ?? 0,
    ratingComments: rs.rating_comments || [],
    sourceBreakdown: {} as Record<string, number>,
  };
  const individualReviews: ReviewItem[] = (data.reviews || []).map((r: any) => {
    const sourceKey = String(
      r.source ||
        r.platform ||
        r.review_source ||
        defaultReviewSource ||
        "unknown",
    ).toLowerCase();
    reviewSourceMap[sourceKey] = (reviewSourceMap[sourceKey] || 0) + 1;
    return {
      author: r.author || r.name || "Anonymous",
      rating: r.rating || 0,
      text: r.text || r.comment || "",
      date: r.date || r.posted_at || "",
      sourceKey,
      sourceLabel: sourceLabelFor(sourceKey),
    };
  });
  reviewsSummary.sourceBreakdown = reviewSourceMap;

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
    googleLocation,
    ratingValue,
    ratingCount,
    avatarUrl,
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

export function formatCount(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function formatPrice(p: CatalogProduct): string {
  if (p.priceOnRequest) return "Price on request";
  const sym = p.currency === "INR" ? "₹" : p.currency || "";
  const fmt = (n: number) => sym + n.toLocaleString("en-IN");
  const unit = p.priceUnit ? ` / ${p.priceUnit}` : "";
  if (p.isPriceRange && p.priceMin != null && p.priceMax != null) {
    return `${fmt(p.priceMin)} – ${fmt(p.priceMax)}${unit}`;
  }
  if (p.priceSingle != null) return `${fmt(p.priceSingle)}${unit}`;
  if (p.priceMin != null) return `${fmt(p.priceMin)}${unit}`;
  return "Price on request";
}

export type SellerData = ReturnType<typeof extractSellerDataFromRaw>;
