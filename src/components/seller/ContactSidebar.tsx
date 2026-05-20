import { useRef, useState } from "react";
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
import TrustGraphModal from "@/components/seller/TrustGraphModal";
import RevealableContactValue from "@/components/seller/RevealableContactValue";
import { resolveSocialAvailability } from "@/lib/socialAvailability";

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

// Contact panel that combines phone, email, website, map, and social presence into one sidebar.
export default function ContactSidebar({ data }: { data: SellerData }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const sectionRef = useRef<HTMLElement>(null);
  const [trustGraphOpen, setTrustGraphOpen] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);
  // Render source chips below contact entries so viewers can see where each detail came from.
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

  // Resolve social URL availability once here so the rest of the sidebar can stay declarative.
  const socialAvailability = resolveSocialAvailability(data);
  const whatsappUrl = socialAvailability.whatsapp?.url || "";
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
  const phoneEntries = data.phoneEntries?.length
    ? data.phoneEntries
    : data.primaryPhone
      ? [
          {
            value: data.primaryPhone,
            role: undefined,
            sources: contactSources.primaryPhone,
          },
        ]
      : [];
  const emailEntries = data.emailEntries?.length
    ? data.emailEntries
    : data.email
      ? [
          {
            value: data.email,
            role: undefined,
            sources: contactSources.email,
          },
        ]
      : [];
  const visiblePhoneEntries = showAllContacts
    ? phoneEntries
    : phoneEntries.slice(0, 2);
  const visibleEmailEntries = showAllContacts
    ? emailEntries
    : emailEntries.slice(0, 2);
  const hasHiddenContactEntries =
    phoneEntries.length > visiblePhoneEntries.length ||
    emailEntries.length > visibleEmailEntries.length;
  const hasSocialLinks = socialPlatforms.some((platform) =>
    Boolean(socialAvailability[platform]?.url),
  );
  const hasMap = Boolean(data.googleMapsEmbedUrl);
  const mapEmbedSrc = data.googleMapsEmbedUrl || "";
  const hasContactDetails =
    visiblePhoneEntries.length > 0 ||
    visibleEmailEntries.length > 0 ||
    Boolean(data.fullAddress) ||
    Boolean(data.website);
  const hasPrimaryCtas = Boolean(whatsappUrl || data.primaryPhone);
  const hasContent =
    phoneEntries.length > 0 ||
    emailEntries.length > 0 ||
    Boolean(data.website) ||
    hasMap ||
    hasSocialLinks ||
    Boolean(whatsappUrl);

  if (!hasContent) return null;

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
                      title="WhatsApp"
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
              {!hasPrimaryCtas && null}
              {whatsappUrl && sourceChips(contactSources.whatsapp)}
              {!whatsappUrl && sourceChips(contactSources.contactCta)}

              {hasContactDetails ? (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl p-6 bg-card border border-border shadow-sm flex flex-col gap-4"
                >
                  {visiblePhoneEntries.map((entry, index) => (
                    <div key={`phone-${entry.value}-${index}`}>
                      <div className="flex flex-wrap items-start gap-2 min-w-0">
                        <RevealableContactValue
                          value={entry.value}
                          href={`tel:${entry.value}`}
                          prefix="+91 "
                          leadingIcon={
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                          }
                          className="flex min-w-0 items-start gap-3 text-foreground group"
                          hideClassName="text-sm font-medium break-words leading-relaxed transition-colors"
                          revealClassName="text-sm font-medium break-words leading-relaxed transition-colors"
                        />
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

                  {visibleEmailEntries.map((entry, index) => (
                    <div key={`email-${entry.value}-${index}`}>
                      <div className="flex flex-wrap items-start gap-2 min-w-0">
                        <RevealableContactValue
                          value={entry.value}
                          href={`mailto:${entry.value}`}
                          leadingIcon={
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                          }
                          className="flex min-w-0 items-start gap-3 text-foreground group"
                          hideClassName="text-sm font-medium break-words leading-relaxed transition-colors"
                          revealClassName="text-sm font-medium break-words leading-relaxed transition-colors"
                        />
                        {entry.role && (
                          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {entry.role}
                          </span>
                        )}
                        {inlineSourceChips(
                          entry.sources || contactSources.email,
                        )}
                      </div>
                    </div>
                  ))}
                  {data.fullAddress && (
                    <div className="flex items-start gap-2 min-w-0 text-foreground">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm leading-relaxed break-words">
                          {data.fullAddress}
                        </span>
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

                  {hasHiddenContactEntries && (
                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAllContacts((value) => !value)}
                        className="w-full rounded-xl border-dashed"
                      >
                        {showAllContacts
                          ? "Show less"
                          : "View more contact details"}
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : null}

              <div className="rounded-2xl p-4 bg-card border border-border shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Trust graph
                    </p>
                    <p className="text-sm text-foreground">
                      See how contact details and sources connect across the
                      data.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTrustGraphOpen(true)}
                    className="rounded-xl"
                  >
                    View trust graph
                  </Button>
                </div>
                {/* {sourceChips(contactSources.contactCta)} */}
              </div>

              {hasSocialLinks ? (
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
              ) : null}
            </motion.div>

            {/* Map */}
            {hasMap ? (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="rounded-2xl overflow-hidden border border-border h-80 md:h-auto min-h-[350px] shadow-sm"
              >
                <iframe
                  src={mapEmbedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location"
                />
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>

      <TrustGraphModal
        data={data}
        open={trustGraphOpen}
        onOpenChange={setTrustGraphOpen}
      />
    </section>
  );
}
