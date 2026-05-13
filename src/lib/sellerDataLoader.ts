import { parseSellerRawObject } from "./sellerRawSchema";

const sellerDataModules = import.meta.glob("../data/*.json", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export interface SellerCatalogSummary {
  id: string;
  sellerName: string;
  fileName: string;
  city?: string;
  description?: string;
}

function normalizeGlid(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getFileNameFromPath(path: string) {
  return path.split("/").pop()?.replace(".json", "") || "";
}

function parseSellerJson(raw: string): unknown | null {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return parseSellerRawObject(parsed);
  } catch {
    return null;
  }
}

function getRawSellerRecord(path: string) {
  return parseSellerJson(sellerDataModules[path]);
}

export async function loadSellerRawDataByGlid(glid: string) {
  const normalizedGlid = normalizeGlid(glid);
  const matchingKey = Object.keys(sellerDataModules).find((key) => {
    const fileName = getFileNameFromPath(key).toLowerCase();
    return fileName === normalizedGlid;
  });

  if (!matchingKey) {
    return null;
  }

  return getRawSellerRecord(matchingKey);
}

export function listAvailableSellerGlids() {
  return Object.keys(sellerDataModules)
    .map((path) => getFileNameFromPath(path))
    .filter(Boolean);
}

export async function listAvailableSellerCatalogs() {
  const summaries: (SellerCatalogSummary | null)[] = await Promise.all(
    Object.entries(sellerDataModules).map(async ([path, rawText]) => {
      const raw = parseSellerJson(rawText) as {
        seller_id?: unknown;
        company_profile?: Record<string, unknown>;
      } | null;

      const fallbackId = getFileNameFromPath(path);
      const sellerId = String(raw?.seller_id || fallbackId || "").trim();
      if (!sellerId) return null;

      const companyProfile = raw?.company_profile || {};
      const sellerName = String(
        (companyProfile.name as { value?: unknown } | undefined)?.value ||
          fallbackId ||
          "Seller",
      ).trim();

      const city = String(
        (companyProfile.city as { value?: unknown } | undefined)?.value || "",
      ).trim();

      const description = String(
        (companyProfile.description as { value?: unknown } | undefined)
          ?.value || "",
      ).trim();

      return {
        id: sellerId,
        sellerName,
        fileName: fallbackId || sellerId,
        city: city || undefined,
        description: description || undefined,
      };
    }),
  );

  return summaries
    .filter((item): item is SellerCatalogSummary => item !== null)
    .sort((a, b) => a.sellerName.localeCompare(b.sellerName));
}