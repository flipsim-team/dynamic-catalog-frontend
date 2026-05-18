export type {
  SocialPlatform,
  SourceMeta,
  ContactEntry,
  ProductSourceTile,
  ProductSourceLink,
  ReviewItem,
  SocialPost,
  SocialProfile,
  CatalogProduct,
} from "./sellerData/types";

export type { SocialAvailabilityMap } from "./sellerData/types";

export {
  extractSellerDataFromRaw,
  extractSellerData,
  extractYouTubeId,
} from "./sellerData/extractSellerDataFromRaw";

export type { SellerData } from "./sellerData/extractSellerDataFromRaw";

// Public helper exports used by components and UI code.
// Move small, shared utilities here when consolidating to avoid deep imports.
export { formatCount, formatPrice } from "./formatters";
