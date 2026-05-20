import { supabase } from "./supabaseClient.ts";
import { parseSellerRawObject } from "./sellerRawSchema";

// Vite eagerly imports every seller JSON file under src/data so the dashboard
// and seller routes can discover catalogs without a runtime filesystem scan.
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

// Convert an imported module path like ../data/123.json into the seller id.
function getFileNameFromPath(path: string) {
  return path.split("/").pop()?.replace(".json", "") || "";
}

// Parse raw JSON text and validate it against the seller raw schema.
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

// Read the already-imported raw payload for a specific seller file.
function getRawSellerRecord(path: string) {
  return parseSellerJson(sellerDataModules[path]);
}

function unwrapSellerRow(row: unknown) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return row;
  }

  const candidate = row as Record<string, unknown>;
  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    !Array.isArray(candidate.data)
  ) {
    return candidate.data;
  }

  return row;
}

function parseGlid(value: string) {
  const parsed = Number(value.trim());
  return Number.isInteger(parsed) ? parsed : null;
}

// Load one seller's raw data from Supabase by matching the requested GLID.
export async function loadSellerRawDataByGlid(glid: string) {
  const parsedGlid = parseGlid(glid);
  if (parsedGlid === null) {
    return null;
  }

  const { data, error } = await supabase
    .from("glid_data")
    .select("*")
    .eq("glid", parsedGlid)
    .single();

  if (error || !data) {
    return null;
  }

  return parseSellerRawObject(unwrapSellerRow(data?.response?.catalog || data?.response));
}

// Return every discovered seller id so the dashboard can show available catalogs.
export function listAvailableSellerGlids() {
  return Object.keys(sellerDataModules)
    .map((path) => getFileNameFromPath(path))
    .filter(Boolean);
}

// Build lightweight dashboard cards from every catalog file without loading the full app data.
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
