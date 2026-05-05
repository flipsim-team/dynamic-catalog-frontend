import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  buildCatalogFeedbackPayload,
  saveCatalogFeedbackSubmission,
} from "@/lib/catalogFeedbackStore";

interface CatalogFeedbackProps {
  sellerId: string;
  sellerName: string;
  triggerSectionId: string;
}

const FEEDBACK_DISMISSED_PREFIX = "seller_catalog_feedback_dismissed_";

function getDismissedKey(sellerId: string) {
  return `${FEEDBACK_DISMISSED_PREFIX}${sellerId}`;
}

export default function CatalogFeedback({
  sellerId,
  sellerName,
  triggerSectionId,
}: CatalogFeedbackProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isNegativeOpen, setIsNegativeOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const feedbackRecipientEmail = "gunjan.bhanarkar@indiamart.com";
  const dismissedKey = getDismissedKey(sellerId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedDismissed = window.localStorage.getItem(dismissedKey) === "1";
    setIsDismissed(storedDismissed);
    if (storedDismissed) {
      return;
    }

    const evaluateVisibility = () => {
      if (window.localStorage.getItem(dismissedKey) === "1") {
        setIsDismissed(true);
        setIsVisible(false);
        return;
      }

      if (isDismissed) return;

      const triggerEl = document.getElementById(triggerSectionId);
      if (!triggerEl) return;

      const rect = triggerEl.getBoundingClientRect();
      const triggerPassed = rect.bottom <= window.innerHeight * 0.72;

      if (triggerPassed) {
        setIsVisible(true);
      }
    };

    evaluateVisibility();
    window.addEventListener("scroll", evaluateVisibility, { passive: true });
    window.addEventListener("resize", evaluateVisibility);

    return () => {
      window.removeEventListener("scroll", evaluateVisibility);
      window.removeEventListener("resize", evaluateVisibility);
    };
  }, [dismissedKey, isDismissed, triggerSectionId]);

  const dismissFeedback = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(dismissedKey, "1");
    }
    setIsDismissed(true);
    setIsNegativeOpen(false);
    setComment("");
    setError("");
    setIsVisible(false);
  };

  const handlePositiveFeedback = async () => {
    const payload = buildCatalogFeedbackPayload({
      sellerId,
      sellerName,
      sentiment: "positive",
      comment: "",
    });

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
      console.log("Backend is not wired yet; keep the local submission as the source of truth.");
    });

    toast({
      title: "Your feedback has been shared with the developer",
      duration: 5000,
    });

    dismissFeedback();
  };

  const handleNegativeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Share why you dislike the catalog before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = buildCatalogFeedbackPayload({
        sellerId,
        sellerName,
        sentiment: "negative",
        comment,
      });

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
        console.log("Backend is not wired yet; keep the local submission as the source of truth.");
      });

      toast({
        title: "Your feedback has been shared with the developer",
        duration: 5000,
      });

      dismissFeedback();
    } catch {
      setError("Unable to submit feedback right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 z-[110] w-[calc(100vw-2rem)] max-w-[420px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background/95 p-4 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <button
              type="button"
              onClick={dismissFeedback}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close feedback"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-8">
              <h3 className="text-sm font-semibold text-foreground">
                How relevant are these results?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Share quick feedback to help improve this catalog.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-amber-400/70 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={() => {
                  void handlePositiveFeedback();
                }}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-amber-400/70 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={() => setIsNegativeOpen(true)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {isNegativeOpen && (
                <motion.form
                  key="negative-feedback"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleNegativeSubmit}
                  className="mt-3 space-y-3 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="catalog-feedback-reason"
                      className="text-xs font-medium text-foreground"
                    >
                      Share why you dislike the catalog
                    </label>
                    <Textarea
                      id="catalog-feedback-reason"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Tell us what should improve"
                      maxLength={800}
                      className="min-h-[84px] rounded-xl"
                    />
                  </div>

                  {error ? (
                    <p className="text-xs text-destructive">{error}</p>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 flex-1 rounded-xl"
                    >
                      {isSubmitting ? "Sending..." : "Send feedback"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 rounded-xl px-3"
                      onClick={dismissFeedback}
                    >
                      Close
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
