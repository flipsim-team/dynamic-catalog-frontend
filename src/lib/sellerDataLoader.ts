import { getSupabaseClient } from "./supabaseClient.ts";
import { parseSellerRawObject } from "./sellerRawSchema";
export interface SellerCatalogSummary {
  id: string;
  sellerName: string;
  fileName: string;
  city?: string;
  description?: string;
}

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
