// Utility formatting helpers used across the app.
// - `formatCount`: human-friendly follower/count formatter (K/M)
// - `formatPrice`: render product price text based on product fields

import type { CatalogProduct } from "./sellerData/types";

/**
 * Format large integer counts into short strings (e.g. 1.2K, 3M).
 * Used for follower counts and other large numeric displays.
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

/**
 * Format product price display string using product shape.
 * Handles ranges, single prices, and "price on request" cases.
 */
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
