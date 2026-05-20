import { motion } from "framer-motion";
import {
  BadgeCheck,
  Award,
  FileCheck,
  Factory,
  MapPin,
  Package,
  Globe,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  verified: BadgeCheck,
  award: Award,
  "file-check": FileCheck,
  factory: Factory,
  "map-pin": MapPin,
  package: Package,
  globe: Globe,
};

interface Badge {
  label: string;
  icon: string;
  url?: string;
  scrollTo?: string;
  tooltip?: string;
}

// Trust badge strip used in the hero to jump to sections or open verified links.
export default function TrustBadges({ badges }: { badges: Badge[] }) {
  // Navigate to the linked destination or scroll to the associated page section.
  const handleClick = (badge: Badge) => {
    if (badge.url) {
      window.open(badge.url, "_blank", "noopener,noreferrer");
    } else if (badge.scrollTo) {
      const el = document.getElementById(badge.scrollTo);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => {
        const Icon = ICON_MAP[badge.icon] || BadgeCheck;
        return (
          <motion.button
            key={badge.label + i}
            onClick={() => handleClick(badge)}
            title={badge.tooltip || badge.label}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + i * 0.05 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold
              bg-white/15 backdrop-blur-xl border border-white/30 text-white
              hover:bg-white/25 hover:border-white/50
              transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Icon className="w-3.5 h-3.5 text-amber-300" />
            <span className="whitespace-nowrap">{badge.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
