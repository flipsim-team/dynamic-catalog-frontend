import emailjs from "@emailjs/browser";
import type { CatalogFeedbackPayload } from "@/lib/catalogFeedbackStore";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();
const RECIPIENT_EMAIL =
  import.meta.env.VITE_FEEDBACK_RECIPIENT_EMAIL?.trim() || "";

// Check whether the EmailJS environment variables are available before trying to send mail.
function hasEmailJsConfig() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

// Send catalog feedback to the configured recipient via EmailJS, with a local fallback reason on failure.
export async function sendFeedbackEmail(payload: CatalogFeedbackPayload) {
  if (!hasEmailJsConfig()) {
    return {
      sent: false,
      reason:
        "EmailJS is not configured yet. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env.",
    };
  }

  const templateParams = {
    to_email: RECIPIENT_EMAIL,
    recipient_email: RECIPIENT_EMAIL,
    seller_id: payload.sellerId,
    seller_name: payload.sellerName,
    sentiment: payload.sentiment,
    comment: payload.comment || "No additional comment",
    submitted_at: payload.submittedAt,
    catalog_path: payload.catalogPath,
    source: payload.source,
    payload_json: JSON.stringify(payload, null, 2),
    // Compatibility aliases for templates still using generic placeholders.
    name: payload.sellerName,
    message: payload.comment || `Sentiment: ${payload.sentiment}`,
    time: payload.submittedAt,
    email: RECIPIENT_EMAIL,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    return { sent: true };
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null
        ? [
            "status" in error ? String(error.status) : null,
            "text" in error ? String(error.text) : null,
            "message" in error ? String(error.message) : null,
          ]
            .filter(Boolean)
            .join(" - ")
        : String(error);

    return {
      sent: false,
      reason: message || "Unable to send email right now.",
    };
  }
}
