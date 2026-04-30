import { forwardRef } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  ArrowUp,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { SellerData, SocialPlatform } from "@/lib/sellerDataExtractor";

const NAV_LINKS = [
  "Overview",
  "About",
  "Products",
  "Categories",
  "Gallery",
  "Social",
  "Reviews",
  "Contact",
];

const PLATFORM_ICONS: Record<SocialPlatform, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  whatsapp: ExternalLink,
};

function classifySocialUrl(url: string): SocialPlatform | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com")) return "facebook";
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "youtube";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("twitter.com") || host.includes("x.com"))
      return "twitter";
    if (host.includes("wa.me") || host.includes("whatsapp.com"))
      return "whatsapp";
    return null;
  } catch {
    return null;
  }
}

const Footer = forwardRef<HTMLElement, { data: SellerData }>(
  ({ data }, ref) => {
    const initials = data.sellerName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const getHref = (link: string) => {
      if (link === "Overview") return "#overview";
      if (link === "Categories") return "#products";
      return `#${link.toLowerCase()}`;
    };
    const contactSources = data.contactSources || {
      primaryPhone: [],
      email: [],
      website: [],
      address: [],
      city: [],
      whatsapp: [],
      contactCta: [],
    };
    const socialUrlByPlatform = (platform: SocialPlatform) =>
      data.socialUrls?.find(
        (entry) => classifySocialUrl(entry.value) === platform,
      )?.value || "";
    const connectLinks = (
      [
        "instagram",
        "youtube",
        "facebook",
        "linkedin",
        "twitter",
      ] as SocialPlatform[]
    )
      .map((platform) => ({ platform, url: socialUrlByPlatform(platform) }))
      .filter((item) => Boolean(item.url));
    const hasConnect = connectLinks.length > 0 || Boolean(data.website);

    return (
      <footer
        ref={ref}
        className="relative bg-foreground text-background pt-16 pb-8 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            className={`grid grid-cols-1 ${hasConnect ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-10`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
                  <span className="font-bold text-sm text-primary-foreground">
                    {initials}
                  </span>
                </div>
                <h3 className="font-bold text-xl">{data.sellerName}</h3>
              </div>
              {data.tagline && (
                <p className="text-sm opacity-60 leading-relaxed line-clamp-3 max-w-xs">
                  {data.tagline}
                </p>
              )}
              <div className="mt-4 space-y-2">
                {data.email && (
                  <div>
                    <a
                      href={`mailto:${data.email}`}
                      className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Mail className="w-3.5 h-3.5" /> {data.email}
                    </a>
                    {contactSources.email.length > 0 && (
                      <p className="mt-1 text-[10px] opacity-50">
                        Source:{" "}
                        {contactSources.email.map((s) => s.label).join(", ")}
                      </p>
                    )}
                  </div>
                )}
                {data.primaryPhone && (
                  <div>
                    <a
                      href={`tel:${data.primaryPhone}`}
                      className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Phone className="w-3.5 h-3.5" /> +91 {data.primaryPhone}
                    </a>
                    {contactSources.primaryPhone.length > 0 && (
                      <p className="mt-1 text-[10px] opacity-50">
                        Source:{" "}
                        {contactSources.primaryPhone
                          .map((s) => s.label)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 opacity-70 text-sm uppercase tracking-wider">
                Navigate
              </h4>
              <div className="space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <motion.a
                    key={link}
                    href={getHref(link)}
                    whileHover={{ x: 4 }}
                    className="block text-sm opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {link}
                  </motion.a>
                ))}
              </div>
            </div>

            {hasConnect && (
              <div>
                <h4 className="font-semibold mb-4 opacity-70 text-sm uppercase tracking-wider">
                  Connect
                </h4>
                {connectLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {connectLinks.map(({ platform, url }) => {
                      const Icon = PLATFORM_ICONS[platform];
                      if (!Icon || !url) return null;

                      return (
                        <motion.a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -2, scale: 1.05 }}
                          className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                          title={`${platform} available`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.a>
                      );
                    })}
                  </div>
                )}
                {data.website && (
                  <div>
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />{" "}
                      {data.website
                        .replace(/https?:\/\//, "")
                        .replace(/\/$/, "")}
                    </a>
                    {contactSources.website.length > 0 && (
                      <p className="mt-1 text-[10px] opacity-50">
                        Source:{" "}
                        {contactSources.website.map((s) => s.label).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-background/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs opacity-40">
              © {new Date().getFullYear()} {data.sellerName}. All rights
              reserved.
            </p>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              whileHover={{ y: -3 }}
              className="flex items-center gap-2 text-xs opacity-40 hover:opacity-80 transition-opacity"
            >
              Back to top <ArrowUp className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </footer>
    );
  },
);

Footer.displayName = "Footer";

export default Footer;
