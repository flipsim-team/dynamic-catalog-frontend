import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import type { SellerData } from "@/lib/sellerDataExtractor";

const MobileCTA = forwardRef<HTMLDivElement, { data: SellerData }>(
  ({ data }, ref) => {
    if (!data.primaryPhone && !data.whatsappUrl) return null;

    const whatsappUrl =
      data.whatsappUrl ||
      `https://wa.me/91${data.primaryPhone.replace(/\D/g, "")}`;
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
      <motion.div
        ref={ref}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-2xl border-t border-border p-2.5 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.1)]"
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sticky-cta-btn flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground shadow-md active:scale-95 hover:shadow-lg transition-all duration-200 px-5 py-4 min-h-12 text-[15px] font-semibold"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
            {contactSources.whatsapp.length > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground text-center">
                {contactSources.whatsapp.map((s) => s.label).join(", ")}
              </p>
            )}
          </div>
          {data.primaryPhone && (
            <div className="flex-1">
              <a
                href={`tel:${data.primaryPhone}`}
                className="sticky-cta-btn flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground shadow-md active:scale-95 hover:shadow-lg transition-all duration-200 px-5 py-4 min-h-12 text-[15px] font-semibold"
              >
                <Phone className="w-5 h-5" /> Call
              </a>
              {contactSources.primaryPhone.length > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground text-center">
                  {contactSources.primaryPhone.map((s) => s.label).join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  },
);

MobileCTA.displayName = "MobileCTA";

export default MobileCTA;
