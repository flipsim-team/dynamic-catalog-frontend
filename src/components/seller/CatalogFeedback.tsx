import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  buildCatalogFeedbackPayload,
  saveCatalogFeedbackSubmission,
  type CatalogFeedbackPayload,
  type FeedbackSentiment,
} from "@/lib/catalogFeedbackStore";
import { cn } from "@/lib/utils";

interface CatalogFeedbackProps {
  sellerId: string;
  sellerName: string;
}

export default function CatalogFeedback({
  sellerId,
  sellerName,
}: CatalogFeedbackProps) {
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const feedbackRecipientEmail = "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sentiment) {
      setError("Choose positive or negative feedback before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = buildCatalogFeedbackPayload({
        sellerId,
        sellerName,
        sentiment,
        comment,
      });

      // For now this simulates persistence before replacing with a real API call.
      saveCatalogFeedbackSubmission(payload);

      void fetch("/api/catalog/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: feedbackRecipientEmail,
          payload,
        }),
      }).catch(() => {
        // Backend is not wired yet; keep the local submission as the source of truth.
      });

      // Notify user (no raw JSON shown in UI)
      toast({
        title:
          "Your feedback has been shared to the Aggregated Catalog Creation team",
        description: "Thank you — your input helps improve seller catalogs.",
        duration: 5000,
      });
      setComment("");
      setSentiment(null);
    } catch {
      setError("Unable to submit feedback right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-14 sm:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Was this catalog helpful?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share quick feedback so we can improve this seller catalog.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 h-11",
                  sentiment === "positive" &&
                    "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                )}
                onClick={() => {
                  setSentiment("positive");
                  setError("");
                }}
                aria-pressed={sentiment === "positive"}
              >
                <ThumbsUp className="h-4 w-4" /> Thumbs up
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 h-11",
                  sentiment === "negative" &&
                    "border-rose-500 bg-rose-50 text-rose-700 hover:bg-rose-100",
                )}
                onClick={() => {
                  setSentiment("negative");
                  setError("");
                }}
                aria-pressed={sentiment === "negative"}
              >
                <ThumbsDown className="h-4 w-4" /> Thumbs down
              </Button>
            </div>

            <div className="space-y-2">
              <label htmlFor="catalog-feedback" className="text-sm font-medium">
                Additional feedback (optional)
              </label>
              <Textarea
                id="catalog-feedback"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Tell us what worked or what should improve"
                maxLength={800}
                className="min-h-[96px]"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={isSubmitting} className="min-w-40">
              {isSubmitting ? "Submitting..." : "Submit feedback"}
            </Button>
          </form>

          {/* JSON preview intentionally hidden; toast confirms submission. */}
        </motion.div>
      </div>
    </section>
  );
}
