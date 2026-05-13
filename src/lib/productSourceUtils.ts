import type { CatalogProduct } from "./sellerData/types";
import { normalizeProductSourceLabel } from "./sourceLabels";

export type SourceFilterOption = {
  key: string;
  label: string;
  count: number;
};

export function normalizeSourceKey(source: string) {
  return String(source || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function isWebsiteSource(value: string) {
  return normalizeSourceKey(value) === "website";
}

export function collectProductSourceEntries(product: CatalogProduct) {
  const entries: SourceFilterOption[] = [];
  const addEntry = (key: string, label: string) => {
    const normalizedKey = normalizeSourceKey(key);
    const normalizedLabel = isWebsiteSource(normalizedKey)
      ? "Website"
      : String(label || "").trim();
    if (!normalizedKey || !normalizedLabel) return;
    entries.push({ key: normalizedKey, label: normalizedLabel, count: 1 });
  };

  const primarySource = String(product.source || "").trim();
  if (primarySource) {
    if (isWebsiteSource(primarySource)) {
      addEntry("website", "Website");
    } else {
      addEntry(primarySource, normalizeProductSourceLabel(primarySource));
    }
  }

  for (const tile of product.sourceTiles || []) {
    addEntry(tile.key, tile.label);
  }

  const KNOWN_PLATFORMS = new Set([
    "youtube",
    "instagram",
    "facebook",
    "linkedin",
    "twitter",
    "x",
    "whatsapp",
  ]);
  for (const link of product.sourceLinks || []) {
    let linkKey = "";
    let linkLabel = "";
    if (link.platform) {
      linkKey = normalizeSourceKey(link.platform);
      linkLabel = normalizeProductSourceLabel(link.platform);
    } else if (link.label) {
      const cand = normalizeSourceKey(link.label);
      if (KNOWN_PLATFORMS.has(cand)) {
        linkKey = cand;
        linkLabel = normalizeProductSourceLabel(cand);
      } else {
        linkKey = "website";
        linkLabel = "Website";
      }
    } else {
      linkKey = "website";
      linkLabel = "Website";
    }
    addEntry(linkKey, linkLabel);
  }

  return entries;
}

export function productMatchesSelectedSources(
  product: CatalogProduct,
  selectedSources: string[],
) {
  if (selectedSources.length === 0) return true;
  const productSources = new Set(
    collectProductSourceEntries(product).map((entry) => entry.key),
  );
  return selectedSources.some((source) => productSources.has(source));
}
