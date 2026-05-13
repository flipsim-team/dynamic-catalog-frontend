/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import SellerAvatar from "./SellerAvatar";
import type { SellerData } from "@/lib/sellerDataExtractor";

// Default nav link definitions; actual list is filtered per-seller data
const DEFAULT_NAV_LINKS = [
  { key: "overview", label: "Overview", href: "#overview" },
  { key: "about", label: "About", href: "#about" },
  { key: "products", label: "Catalog", href: "#products" },
  { key: "gallery", label: "Gallery", href: "#gallery" },
  { key: "social", label: "Social", href: "#social" },
  { key: "reviews", label: "Ratings & Reviews", href: "#reviews" },
  { key: "contact", label: "Contact", href: "#contact" },
];

export default function NavBar({
  data,
  galleryVisible = false,
  socialVisible = false,
}: {
  data: SellerData;
  galleryVisible?: boolean;
  socialVisible?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Build nav links dynamically based on which sections have data
  const navLinks = DEFAULT_NAV_LINKS.filter((link) => {
    switch (link.key) {
      case "overview":
        return true;
      case "about":
        return Boolean(data.description || data.businessType || data.tagline);
      case "products":
        return Boolean((data as any).showcasedItems > 0);
      case "gallery":
        // only show gallery link if the gallery section is actually visible
        return Boolean(galleryVisible);
      case "social":
        // only show social link if the social section is actually visible
        return Boolean(socialVisible);
      case "reviews":
        return Boolean(
          (data as any).reviewsSummary?.noOfRatings > 0 ||
          (Array.isArray((data as any).individualReviews) &&
            (data as any).individualReviews.length > 0),
        );
      case "contact":
        return Boolean(data.primaryPhone || data.email || data.fullAddress);
      default:
        return true;
    }
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [navLinks]);

  const contactHref = data.primaryPhone
    ? `tel:${data.primaryPhone}`
    : "#contact";
  const quoteHref = data.email
    ? `mailto:${data.email}?subject=Quote Request`
    : data.primaryPhone
      ? `https://wa.me/91${data.primaryPhone}`
      : "#contact";

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const id = href.slice(1);

    const scrollToSection = () => {
      if (id === "overview") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("overview");
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveSection(id);
      }
    };

    if (mobileOpen) {
      setMobileOpen(false);
      setTimeout(scrollToSection, 300); // ⬅️ wait for menu animation
    } else {
      scrollToSection();
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/95 backdrop-blur-2xl shadow-[0_1px_12px_-4px_rgba(0,0,0,0.08)] border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#overview"
            onClick={(e) => handleNavClick(e, "#overview")}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <motion.div
              whileHover={{ rotate: 4, scale: 1.08 }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md overflow-hidden border border-white/10"
            >
              <SellerAvatar
                sellerName={data.sellerName}
                avatarCandidates={data.avatarCandidates}
                imageClassName="h-full w-full object-contain bg-white/50 p-px"
                fallbackClassName="text-primary-foreground font-bold text-sm"
              />
            </motion.div>
            <span
              className={`font-bold text-lg hidden sm:block transition-colors ${scrolled ? "text-foreground" : "text-white"}`}
            >
              {data.sellerName.split(" ")[0]}
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-1 bg-card/60 backdrop-blur-lg rounded-full p-1 border border-border/60 shadow-sm">
            {navLinks.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeSection === link.href.slice(1)
                    ? "text-primary-foreground"
                    : scrolled
                      ? "text-foreground/70 hover:text-foreground"
                      : "text-white/85 hover:text-white"
                }`}
              >
                {activeSection === link.href.slice(1) && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 rounded-full bg-primary shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle className="shadow-sm" />
            <Button
              variant="outline"
              size="sm"
              asChild
              className={`rounded-full transition-all duration-300 ${!scrolled ? "border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm" : ""}`}
            >
              <a href={contactHref}>
                <Phone className="w-4 h-4 mr-1" /> Contact
              </a>
            </Button>
            <Button size="sm" asChild className="rounded-full">
              <a href={quoteHref}>
                <MessageSquare className="w-4 h-4 mr-1" /> Get Quote
              </a>
            </Button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X
                className={`w-6 h-6 ${scrolled ? "text-foreground" : "text-white"}`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${scrolled ? "text-foreground" : "text-white"}`}
              />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-card/98 backdrop-blur-2xl border-t border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`block px-4 py-3.5 rounded-xl text-base font-semibold transition-all active:scale-[0.98] ${
                    activeSection === link.href.slice(1)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="px-4 pb-2 pt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground/80">
                  Theme
                </span>
                <ThemeToggle className="shadow-none" />
              </div>
              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 rounded-full h-11"
                >
                  <a href={contactHref}>
                    <Phone className="w-4 h-4 mr-1" /> Contact
                  </a>
                </Button>
                <Button size="sm" asChild className="flex-1 rounded-full h-11">
                  <a href={quoteHref}>
                    <MessageSquare className="w-4 h-4 mr-1" /> Quote
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
