import type { SourceMeta } from "./sellerData/types";

/** Maps raw source keys (e.g. from JSON) to human-readable labels. */
export function sourceLabelFor(source: string): string {
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

export function toSourceMetaList(rawSources: string[]): SourceMeta[] {
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

/** Display label for catalog product source filter chips (aligned with known platforms). */
export function normalizeProductSourceLabel(source: string): string {
  const key = String(source || "")
    .trim()
    .toLowerCase();
  if (key === "youtube") return "YouTube";
  if (key === "instagram") return "Instagram";
  if (key === "facebook") return "Facebook";
  if (key === "linkedin") return "LinkedIn";
  if (key === "twitter") return "Twitter/X";
  if (key === "whatsapp") return "WhatsApp";
  if (key === "website") return "Website";
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : "Source";
}
