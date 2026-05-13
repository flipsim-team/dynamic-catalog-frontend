import { type ReactNode } from "react";
import { motion } from "framer-motion";

const COLLAPSED_CARD_HEIGHT = 430;
const EXPANDED_CARD_MAX_HEIGHT = 1600;

export function ExpandableSocialCard({
  cardId,
  isExpanded,
  isMobile,
  onToggle,
  onHoverStart,
  onHoverEnd,
  children,
}: {
  cardId: string;
  isExpanded: boolean;
  isMobile: boolean;
  onToggle: (id: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        y: isExpanded ? -6 : 0,
        boxShadow: isExpanded
          ? "0 18px 38px rgba(0, 0, 0, 0.2)"
          : "0 6px 18px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.8 }}
      onMouseEnter={!isMobile ? () => onHoverStart(cardId) : undefined}
      onMouseLeave={!isMobile ? () => onHoverEnd(cardId) : undefined}
      onClick={() => onToggle(cardId)}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 ${
        isExpanded ? "shadow-2xl" : "shadow-sm hover:shadow-xl"
      }`}
    >
      <motion.div
        initial={false}
        animate={{
          maxHeight: isExpanded
            ? EXPANDED_CARD_MAX_HEIGHT
            : COLLAPSED_CARD_HEIGHT,
        }}
        transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.9 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>

      {!isExpanded && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card via-card/95 to-transparent" />
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(cardId);
          }}
          className="pointer-events-auto inline-flex rounded-full bg-background/95 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm"
        >
          {isMobile
            ? isExpanded
              ? "Tap to collapse"
              : "Tap to view"
            : isExpanded
              ? ""
              : "Hover to expand"}
        </button>
      </div>
    </motion.div>
  );
}
