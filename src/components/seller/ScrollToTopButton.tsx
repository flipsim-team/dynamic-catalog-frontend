import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

// Floating button that appears after the user has scrolled far enough down the page.
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Keep the button visibility tied to the current scroll position.
    const handleScroll = () => {
      setIsVisible(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 18, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.9 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group fixed bottom-5 right-5 z-[80] h-12 w-12 rounded-full border border-primary/20 bg-primary/95 text-primary-foreground shadow-[0_16px_36px_-16px_hsl(var(--primary)/0.85)] backdrop-blur-md sm:bottom-7 sm:right-7"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white/30 blur-md"
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.16, 0.3] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="relative flex items-center justify-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
