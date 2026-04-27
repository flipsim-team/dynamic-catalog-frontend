import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SellerData, SocialPlatform } from "@/lib/sellerDataExtractor";

const PLATFORM_META: Record<
  SocialPlatform,
  { icon: LucideIcon; gradient: string }
> = {
  instagram: {
    icon: Instagram,
    gradient: "from-purple-500 via-pink-500 to-orange-400",
  },
  facebook: { icon: Facebook, gradient: "from-blue-600 to-blue-500" },
  youtube: { icon: Youtube, gradient: "from-red-600 to-red-500" },
  twitter: { icon: Twitter, gradient: "from-gray-800 to-gray-700" },
  linkedin: { icon: Linkedin, gradient: "from-blue-700 to-blue-600" },
  whatsapp: { icon: MessageCircle, gradient: "from-green-500 to-emerald-400" },
};

export default function ContactSidebar({ data }: { data: SellerData }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const sectionRef = useRef<HTMLElement>(null);

  const whatsappUrl =
    data.whatsappUrl ||
    (data.primaryPhone
      ? `https://wa.me/91${data.primaryPhone}?text=${encodeURIComponent(`Hi, I'm interested in your products.`)}`
      : "");
  const sourceChips = (sources?: Array<{ key: string; label: string }>) => {
    if (!sources || sources.length === 0) return null;
    return (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <span
            key={source.key}
            className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {source.label}
          </span>
        ))}
      </div>
    );
  };
  const inlineSourceChips = (
    sources?: Array<{ key: string; label: string }>,
  ) => {
    if (!sources || sources.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {sources.map((source) => (
          <span
            key={source.key}
            className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {source.label}
          </span>
        ))}
      </div>
    );
  };

  const socialAvailability = data.socialAvailability || {
    instagram: {
      url:
        data.socialProfiles.find((p) => p.platform === "instagram")?.url || "",
      hasPosts: !!data.socialProfiles.find((p) => p.platform === "instagram")
        ?.posts?.length,
    },
    facebook: {
      url:
        data.socialProfiles.find((p) => p.platform === "facebook")?.url || "",
      hasPosts: !!data.socialProfiles.find((p) => p.platform === "facebook")
        ?.posts?.length,
    },
    youtube: {
      url: data.socialProfiles.find((p) => p.platform === "youtube")?.url || "",
      hasPosts: !!data.socialProfiles.find((p) => p.platform === "youtube")
        ?.posts?.length,
    },
    twitter: {
      url: data.socialProfiles.find((p) => p.platform === "twitter")?.url || "",
      hasPosts: !!data.socialProfiles.find((p) => p.platform === "twitter")
        ?.posts?.length,
    },
    linkedin: {
      url:
        data.socialProfiles.find((p) => p.platform === "linkedin")?.url || "",
      hasPosts: !!data.socialProfiles.find((p) => p.platform === "linkedin")
        ?.posts?.length,
    },
    whatsapp: { url: whatsappUrl, hasPosts: !!whatsappUrl },
  };
  const socialPlatforms: SocialPlatform[] = [
    "instagram",
    "youtube",
    "facebook",
    "linkedin",
    "twitter",
  ];
  const contactSources = data.contactSources || {
    primaryPhone: [],
    email: [],
    website: [],
    address: [],
    city: [],
    whatsapp: [],
    contactCta: [],
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 sm:py-28 section-alt relative overflow-hidden"
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
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Get in Touch
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-5"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {whatsappUrl && (
                  <Button
                    asChild
                    size="lg"
                    className="contact-cta-btn flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all max-md:min-h-12 max-md:px-6 max-md:py-3.5 max-md:text-[15px] max-md:font-semibold"
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                    </a>
                  </Button>
                )}
                {data.primaryPhone && (
                  <Button
                    asChild
                    size="lg"
                    className="contact-cta-btn flex-1 rounded-2xl h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all max-md:min-h-12 max-md:px-6 max-md:py-3.5 max-md:text-[15px] max-md:font-semibold"
                  >
                    <a href={`tel:${data.primaryPhone}`}>
                      <Phone className="w-5 h-5 mr-2" /> Call Now
                    </a>
                  </Button>
                )}
              </div>
              {whatsappUrl && sourceChips(contactSources.whatsapp)}
              {!whatsappUrl && sourceChips(contactSources.contactCta)}

              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-2xl p-6 bg-card border border-border shadow-sm flex flex-col gap-4"
              >
                {(data.phoneEntries?.length
                  ? data.phoneEntries
                  : data.primaryPhone
                    ? [
                        {
                          value: data.primaryPhone,
                          role: undefined,
                          sources: contactSources.primaryPhone,
                        },
                      ]
                    : []
                ).map((entry, index) => (
                  <div key={`phone-${entry.value}-${index}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${entry.value}`}
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          +91 {entry.value}
                        </span>
                      </a>
                      {entry.role && (
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {entry.role}
                        </span>
                      )}
                      {inlineSourceChips(
                        entry.sources || contactSources.primaryPhone,
                      )}
                    </div>
                  </div>
                ))}

                {(data.emailEntries?.length
                  ? data.emailEntries
                  : data.email
                    ? [
                        {
                          value: data.email,
                          role: undefined,
                          sources: contactSources.email,
                        },
                      ]
                    : []
                ).map((entry, index) => (
                  <div key={`email-${entry.value}-${index}`}>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <a
                        href={`mailto:${entry.value}`}
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[260px]">
                          {entry.value}
                        </span>
                      </a>
                      {entry.role && (
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {entry.role}
                        </span>
                      )}
                      {inlineSourceChips(entry.sources || contactSources.email)}
                    </div>
                  </div>
                ))}
                {data.fullAddress && (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-foreground">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">{data.fullAddress}</span>
                      {inlineSourceChips(contactSources.address)}
                    </div>
                  </div>
                )}
                {data.website && (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors group min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[260px]">
                          {data.website
                            .replace(/https?:\/\//, "")
                            .replace(/\/$/, "")}
                        </span>
                      </a>
                      {inlineSourceChips(contactSources.website)}
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="rounded-2xl p-4 bg-card border border-border shadow-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Contact Presence
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.primaryPhone && (
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      Phone
                    </span>
                  )}
                  {data.email && (
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      Email
                    </span>
                  )}
                  {data.website && (
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      Website
                    </span>
                  )}
                  {whatsappUrl && (
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      WhatsApp
                    </span>
                  )}
                </div>
                {sourceChips(contactSources.contactCta)}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                  Social Presence
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialPlatforms.map((platform) => {
                    const meta = PLATFORM_META[platform];
                    const Icon = meta.icon;
                    const availability = socialAvailability[platform];
                    if (!availability?.url) return null;
                    return (
                      <motion.a
                        key={platform}
                        href={availability.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow`}
                        title={`${platform} profile`}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.a>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Only platforms with an available URL are shown here.
                </p>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="rounded-2xl overflow-hidden border border-border h-80 md:h-auto min-h-[350px] shadow-sm"
            >
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(data.fullAddress || data.city || "India")}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
