export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "twitter"
  | "linkedin"
  | "whatsapp";

/** Internal shape for wrapped JSON fields */
export interface ValueWithSources<T> {
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
  sourceUrl?: string;
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

export type SocialAvailabilityMap = Record<
  SocialPlatform,
  { url: string; hasPosts: boolean }
>;
