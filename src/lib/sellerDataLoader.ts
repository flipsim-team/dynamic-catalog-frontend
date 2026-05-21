import { getSupabaseClient } from "./supabaseClient.ts";
import { parseSellerRawObject } from "./sellerRawSchema";

/*
Legacy JSON-folder workflow kept here for manual review only.

// Vite eagerly imports every seller JSON file under src/data so the dashboard
// and seller routes can discover catalogs without a runtime filesystem scan.
const sellerDataModules = import.meta.glob("../data/*.json", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
*/

export interface SellerCatalogSummary {
  id: string;
  sellerName: string;
  fileName: string;
  city?: string;
  description?: string;
}

/*
Legacy JSON-folder helpers kept here for manual review only.

// Legacy helper: convert an imported module path like ../data/123.json into the seller id.
function getFileNameFromPath(path: string) {
  return path.split("/").pop()?.replace(".json", "") || "";
}

// Legacy helper: parse raw JSON text and validate it against the seller raw schema.
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

// Legacy helper: read the already-imported raw payload for a specific seller file.
function getRawSellerRecord(path: string) {
  return parseSellerJson(sellerDataModules[path]);
}

// Legacy helper: return the locally discovered GLIDs from src/data.
function listAvailableSellerGlids() {
  return Object.keys(sellerDataModules)
    .map((path) => getFileNameFromPath(path))
    .filter(Boolean);
}

// Legacy helper: build dashboard cards from local JSON files instead of Supabase rows.
async function listAvailableSellerCatalogs() {
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
*/

// 6. Normalize the backend row shape before validating it against the seller raw schema.
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

// 7. The backend stores GLID as an integer, so reject any route value that does not parse cleanly.
function parseGlid(value: string) {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = BigInt(trimmed);
  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
  const minSafe = BigInt(Number.MIN_SAFE_INTEGER);

  if (parsed > maxSafe || parsed < minSafe) {
    return null;
  }

  return Number(parsed);
}

// Load one seller's raw data from Supabase by matching the requested GLID.
export async function loadSellerRawDataByGlid(glid: string) {
  // 8. Convert the route string into the integer key Supabase expects.
  const parsedGlid = parseGlid(glid);
  if (parsedGlid === null) {
    return null;
  }

  // 9. Fetch the single backend row for this catalog.
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("glid_data")
    .select("*")
    .eq("glid", parsedGlid)
    .single();
  // console.log("Supabase query result for GLID", parsedGlid, { data, error });
  if (error || !data) {
    return null;
  }

  // 10. Pull out the nested payload shape, then validate it before handing it to the extractor.
  return parseSellerRawObject(
    unwrapSellerRow(data?.response?.catalog || data?.response),
  );
}
