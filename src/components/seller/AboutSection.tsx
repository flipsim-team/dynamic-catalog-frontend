/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Building2,
  Globe,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SellerData, SocialPlatform } from "@/lib/sellerDataExtractor";
import { formatCount } from "@/lib/sellerDataExtractor";

const PLATFORM_META: Record<
  SocialPlatform,
  { icon: any; label: string; gradient: string }
> = {
  instagram: {
    icon: Instagram,
    label: "Instagram",
    gradient: "from-purple-500 via-pink-500 to-orange-400",
  },
  facebook: {
    icon: Facebook,
    label: "Facebook",
    gradient: "from-blue-600 to-blue-500",
  },
  youtube: {
    icon: Youtube,
    label: "YouTube",
    gradient: "from-red-600 to-red-500",
  },
  twitter: {
    icon: Twitter,
    label: "X / Twitter",
    gradient: "from-gray-800 to-gray-700",
  },
  linkedin: {
    icon: Linkedin,
    label: "LinkedIn",
    gradient: "from-blue-700 to-blue-600",
  },
  whatsapp: {
    icon: ExternalLink,
    label: "WhatsApp",
    gradient: "from-green-500 to-emerald-400",
  },
};

export default function AboutSection({ data }: { data: SellerData }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const description = data.description || data.tagline || "";
  const sortedSocial = [...data.socialProfiles]
    .filter((profile) => Boolean(profile.url))
    .sort((a, b) => b.followers - a.followers);
  const hasBusinessMeta = Boolean(
    data.businessType || data.products.length > 0 || data.categories.length > 0,
  );
  const mapQuery = data.fullAddress || data.city || "";
  const mapEmbedSrc = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : "";
  const hasMap = Boolean(mapEmbedSrc);
  const hasSocialPresence = sortedSocial.length > 0;
  const hasAnyAboutData =
    Boolean(description) || hasBusinessMeta || hasMap || hasSocialPresence;

  if (!hasAnyAboutData) return null;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 sm:py-28 bg-background relative overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary" />
      </motion.div>

      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-10 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            About {data.sellerName}
          </motion.h2>

          <motion.div variants={itemVariants} className="space-y-6">
            {description && (
              <div
                style={{ userSelect: "none" }}
                className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed"
              >
                <p>{description}</p>
              </div>
            )}

            {hasBusinessMeta && (
              <div className="flex flex-wrap gap-2">
                {data.businessType && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-1.5 font-medium"
                  >
                    {data.businessType}
                  </Badge>
                )}
                {data.products.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-1.5 font-medium"
                  >
                    {data.products.length} Products
                  </Badge>
                )}
                {data.categories.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-1.5 font-medium"
                  >
                    {data.categories.length} Categories
                  </Badge>
                )}
              </div>
            )}

            {(hasMap || hasSocialPresence) && (
              <div
                className={`grid gap-6 ${hasMap && hasSocialPresence ? "lg:grid-cols-[65fr_35fr]" : "grid-cols-1"}`}
              >
                {hasMap && (
                  <div className="col-span-1">
                    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                      <div className="p-4 flex items-start gap-3 border-b border-border">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            Headquarters
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {data.fullAddress || data.city}
                          </p>
                        </div>
                        {data.googleLocation && (
                          <a
                            href={data.googleLocation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            Map <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="aspect-video bg-muted">
                        <iframe
                          title="Location"
                          src={mapEmbedSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {hasSocialPresence && (
                  <div className="space-y-3 col-span-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-semibold">
                      Social presence
                    </p>
                    <div className="flex flex-col gap-3">
                      {sortedSocial.map((profile) => {
                        const meta = PLATFORM_META[profile.platform];
                        if (!meta) return null;
                        const Icon = meta.icon;

                        return (
                          <motion.a
                            key={profile.platform}
                            href={profile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.01 }}
                            className="flex w-full items-center gap-3 rounded-2xl p-4 bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                          >
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-sm">
                                {meta.label}
                              </p>
                              {profile.followers > 0 && (
                                <p className="text-xs text-primary font-semibold">
                                  {formatCount(profile.followers)} followers
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
