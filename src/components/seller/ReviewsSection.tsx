import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, StarHalf, ExternalLink } from "lucide-react";
import type { SellerData } from "@/lib/sellerDataExtractor";

function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f${i}`}
          className={`${sizes[size]} fill-amber-400 text-amber-400`}
        />
      ))}
      {half && (
        <StarHalf className={`${sizes[size]} fill-amber-400 text-amber-400`} />
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`${sizes[size]} text-border`} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ data }: { data: SellerData }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const sectionRef = useRef<HTMLElement>(null);
  const voicesScrollRef = useRef<HTMLDivElement>(null);
  const autoDirectionRef = useRef<1 | -1>(1);
  const [selectedStars, setSelectedStars] = useState<number | "all">("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [allowAutoScroll, setAllowAutoScroll] = useState(true);

  const rating = data.reviewsSummary.totalRating;
  const count = data.reviewsSummary.noOfRatings;
  const reviews = data.individualReviews || [];
  const sourceBreakdown = data.reviewsSummary.sourceBreakdown || {};
  const sourceOptions = useMemo(() => {
    const labels = Object.entries(sourceBreakdown).map(([key, count]) => ({
      key,
      label: reviews.find((r) => r.sourceKey === key)?.sourceLabel || key,
      count,
    }));
    if (labels.length > 0) return labels;

    const counts: Record<string, number> = {};
    for (const review of reviews) {
      const key = review.sourceKey || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([key, count]) => ({
      key,
      label: reviews.find((r) => r.sourceKey === key)?.sourceLabel || key,
      count,
    }));
  }, [reviews, sourceBreakdown]);
  const primarySourceLabel =
    sourceOptions.length === 1
      ? sourceOptions[0].label
      : sourceOptions.length > 1
        ? "Multiple"
        : "Public";
  const hasIndividual = reviews.length > 0;
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const starMatch =
        selectedStars === "all" || Math.round(review.rating) === selectedStars;
      const sourceMatch =
        selectedSource === "all" || review.sourceKey === selectedSource;
      return starMatch && sourceMatch;
    });
  }, [reviews, selectedSource, selectedStars]);
  const hasFilteredResults = filteredReviews.length > 0;
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const review of reviews) {
      const rounded = Math.round(review.rating);
      if (rounded >= 1 && rounded <= 5) counts[rounded] += 1;
    }
    return counts;
  }, [reviews]);

  useEffect(() => {
    setSelectedSource("all");
  }, [selectedStars]);

  useEffect(() => {
    const container = voicesScrollRef.current;
    if (!container || !inView || !hasIndividual || !hasFilteredResults) return;

    let rafId = 0;
    let lastTimestamp = 0;
    const speedPxPerSecond = 14;

    const step = (timestamp: number) => {
      const scrollEl = voicesScrollRef.current;
      if (!scrollEl) return;

      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const maxScrollTop = Math.max(
        scrollEl.scrollHeight - scrollEl.clientHeight,
        0,
      );
      if (allowAutoScroll && maxScrollTop > 0) {
        let nextScrollTop =
          scrollEl.scrollTop +
          autoDirectionRef.current * speedPxPerSecond * deltaSeconds;

        if (nextScrollTop >= maxScrollTop) {
          nextScrollTop = maxScrollTop;
          autoDirectionRef.current = -1;
        } else if (nextScrollTop <= 0) {
          nextScrollTop = 0;
          autoDirectionRef.current = 1;
        }

        scrollEl.scrollTop = nextScrollTop;
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    allowAutoScroll,
    hasFilteredResults,
    hasIndividual,
    inView,
    selectedSource,
    selectedStars,
  ]);

  if (!rating && !count && !hasIndividual) return null;

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="py-20 sm:py-28 bg-background relative overflow-hidden"
    >
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Trust signals
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Ratings & Reviews
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Ratings and reviews aggregated from available public sources.
            </p>
          </div>

          <div
            className={`grid ${hasIndividual ? "lg:grid-cols-[1.1fr_0.9fr]" : "grid-cols-1"} gap-6 lg:items-stretch`}
          >
            {/* Aggregate */}
            {rating != null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.12, duration: 0.65 }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-[2rem] p-8 sm:p-9 bg-card border border-border shadow-sm h-full flex flex-col lg:h-[470px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-transparent to-primary/5" />
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
                <div className="relative h-full flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <span className="font-bold text-sm">G</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Public Rating
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Aggregated from public listings
                        </p>
                      </div>
                    </div>
                    {data.googleLocation && (
                      <a
                        href={data.googleLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        View Source <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <span className="text-7xl sm:text-8xl font-black tracking-tight text-foreground leading-none">
                      {rating.toFixed(1)}
                    </span>
                    <div className="pb-2">
                      <StarRating rating={rating} size="lg" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        out of 5.0 • {count} ratings
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                        Verified
                      </p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        Yes
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                        Total ratings
                      </p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                        Source
                      </p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {primarySourceLabel}
                      </p>
                    </div>
                  </div>
                  {hasIndividual && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-3">
                        Filter customer voices
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStars("all")}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            selectedStars === "all"
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          All ({reviews.length})
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSelectedStars(star)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                              selectedStars === star
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:border-primary/40"
                            }`}
                          >
                            {star} <Star className="w-3.5 h-3.5 fill-current" />{" "}
                            ({starCounts[star]})
                          </button>
                        ))}
                      </div>
                      {sourceOptions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSource("all")}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                              selectedSource === "all"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:border-primary/40"
                            }`}
                          >
                            All Sources
                          </button>
                          {sourceOptions.map((option) => (
                            <button
                              type="button"
                              key={option.key}
                              onClick={() => setSelectedSource(option.key)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                selectedSource === option.key
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-border hover:border-primary/40"
                              }`}
                            >
                              {option.label} ({option.count})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Individual reviews */}
            {hasIndividual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.65 }}
                className="rounded-[2rem] p-7 sm:p-8 bg-card border border-border shadow-sm flex flex-col h-[470px]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-bold mb-4">
                  Customer voices
                </p>

                <div
                  ref={voicesScrollRef}
                  className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1"
                  onPointerDown={() => setAllowAutoScroll(false)}
                  onWheel={() => setAllowAutoScroll(false)}
                  onTouchStart={() => setAllowAutoScroll(false)}
                >
                  {filteredReviews.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border p-4 bg-muted/30"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-semibold text-foreground text-sm">
                          {r.author}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {r.sourceLabel}
                          </span>
                          {r.rating > 0 && (
                            <StarRating rating={r.rating} size="sm" />
                          )}
                        </div>
                      </div>
                      {r.text && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {r.text}
                        </p>
                      )}
                      {r.date && (
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {r.date}
                        </p>
                      )}
                    </div>
                  ))}
                  {!hasFilteredResults && (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center bg-muted/20">
                      <p className="font-semibold text-foreground text-sm">
                        No reviews found for selected filters
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try another source or star filter to view available
                        customer voices.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
