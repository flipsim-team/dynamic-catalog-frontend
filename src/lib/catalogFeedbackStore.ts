export type FeedbackSentiment = "positive" | "negative";

export interface CatalogFeedbackPayload {
  id: string;
  sellerId: string;
  sellerName: string;
  sentiment: FeedbackSentiment;
  comment: string;
  submittedAt: string;
  catalogPath: string;
  source: "catalog-feedback-ui";
}

const FEEDBACK_STORAGE_KEY = "seller_catalog_feedback_submissions";

// Read submissions from localStorage and discard anything that does not match the saved payload shape.
function safeParsePayloadArray(raw: string | null): CatalogFeedbackPayload[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CatalogFeedbackPayload => {
      if (!item || typeof item !== "object") return false;
      return (
        typeof item.id === "string" &&
        typeof item.sellerId === "string" &&
        typeof item.sellerName === "string" &&
        (item.sentiment === "positive" || item.sentiment === "negative") &&
        typeof item.comment === "string" &&
        typeof item.submittedAt === "string" &&
        typeof item.catalogPath === "string" &&
        item.source === "catalog-feedback-ui"
      );
    });
  } catch {
    return [];
  }
}

// Generate a stable-enough submission id in browsers that do not support crypto.randomUUID.
function getSubmissionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Build the exact payload persisted by the feedback UI and later consumed by the dashboard.
export function buildCatalogFeedbackPayload(input: {
  sellerId: string;
  sellerName: string;
  sentiment: FeedbackSentiment;
  comment: string;
}): CatalogFeedbackPayload {
  const { sellerId, sellerName, sentiment, comment } = input;

  return {
    id: getSubmissionId(),
    sellerId: sellerId.trim() || "unknown",
    sellerName: sellerName.trim() || "Seller",
    sentiment,
    comment: comment.trim(),
    submittedAt: new Date().toISOString(),
    catalogPath:
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "",
    source: "catalog-feedback-ui",
  };
}

// Return all stored feedback submissions for the current browser session.
export function listCatalogFeedbackSubmissions(): CatalogFeedbackPayload[] {
  if (typeof window === "undefined") return [];

  return safeParsePayloadArray(
    window.localStorage.getItem(FEEDBACK_STORAGE_KEY),
  );
}

// Prepend a new feedback submission and persist the updated array to localStorage.
export function saveCatalogFeedbackSubmission(
  payload: CatalogFeedbackPayload,
): CatalogFeedbackPayload[] {
  if (typeof window === "undefined") return [payload];

  const current = listCatalogFeedbackSubmissions();
  const next = [payload, ...current];
  window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
  return next;
}
