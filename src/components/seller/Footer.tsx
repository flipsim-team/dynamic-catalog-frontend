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
import SellerAvatar from "./SellerAvatar";
import RevealableContactValue from "./RevealableContactValue";
import type { SellerData, SocialPlatform } from "@/lib/sellerDataExtractor";
import { classifySocialPlatformUrl } from "@/lib/socialPlatform";

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

const Footer = forwardRef<HTMLElement, { data: SellerData }>(
  ({ data }, ref) => {
    const getHref = (link: string) => {
      if (link === "Overview") return "#overview";
      if (link === "Categories") return "#products";
      return `#${link.toLowerCase()}`;
    };

    const scrollToAbout = () => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
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
        (entry) => classifySocialPlatformUrl(entry.value) === platform,
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
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center shadow-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.22),transparent_58%)]" />
                  <SellerAvatar
                    sellerName={data.sellerName}
                    avatarCandidates={data.avatarCandidates}
                    imageClassName="relative z-10 h-full w-full object-contain p-1"
                    fallbackClassName="relative z-10 font-bold text-sm text-white"
                  />
                </div>
                <h3 className="font-bold text-xl">{data.sellerName}</h3>
              </div>
              {data.tagline && (
                <p
                  onClick={scrollToAbout}
                  className="text-sm opacity-60 leading-relaxed line-clamp-3 max-w-xs cursor-pointer hover:opacity-100 transition-opacity"
                  title="Seller Description. Click to read full description in About section"
                >
                  {data.tagline}
                </p>
              )}
              <div className="mt-4 space-y-2">
                {data.email && (
                  <div>
                    <RevealableContactValue
                      value={data.email}
                      href={`mailto:${data.email}`}
                      leadingIcon={<Mail className="w-3.5 h-3.5" />}
                      className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                      hideClassName="transition-colors hover:opacity-100"
                      revealClassName="transition-colors opacity-100"
                    />
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
                    <RevealableContactValue
                      value={data.primaryPhone}
                      href={`tel:${data.primaryPhone}`}
                      prefix="+91 "
                      leadingIcon={<Phone className="w-3.5 h-3.5" />}
                      className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                      hideClassName="transition-colors hover:opacity-100"
                      revealClassName="transition-colors opacity-100"
                    />
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
