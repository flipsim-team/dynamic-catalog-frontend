import { z } from "zod";

/** Validates parsed JSON is a plain object (not array); keys are preserved for the extractor. */
const sellerRawRootSchema = z.record(z.string(), z.unknown());

// Keep malformed seller payloads out of the extractor by returning null on schema failure.
export function parseSellerRawObject(
  raw: unknown,
): Record<string, unknown> | null {
  const result = sellerRawRootSchema.safeParse(raw);
  return result.success ? result.data : null;
}
