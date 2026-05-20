import { useState, useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  Tag,
  Package,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { type CatalogProduct, formatPrice } from "@/lib/sellerDataExtractor";
import { productSourceIcon } from "./productDetailModal/sourceIcons";

interface Props {
  product: CatalogProduct | null;
  onClose: () => void;
  enquireHref: string;
  onPrev?: () => void;
  onNext?: () => void;
  onImageUnavailable?: (productId: string) => void;
}

// Full-screen product modal used from the catalog grid and product navigation controls.
export default function ProductDetailModal({
  product,
  onClose,
  enquireHref,
  onPrev,
  onNext,
  onImageUnavailable,
}: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(new Set());
  const isOpen = !!product;

  // Lock background scrolling while the modal is open so the page does not move behind it.
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isOpen]);

  // Reset image state whenever a different product is opened.
  useEffect(() => {
    if (product) {
      setPhotoIdx(0);
      setImageError(false);
      setFailedPhotos(new Set());
    }
  }, [product]);

  // Close the modal on Escape so keyboard users can dismiss it quickly.
  useEffect(() => {
    if (isOpen) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isOpen, onClose]);

  if (!product) return null;

  const photos =
    product.photos.length > 0
      ? product.photos
      : product.primaryPhoto
        ? [product.primaryPhoto]
        : [];
  const currentPhoto = photos[photoIdx];
  const hasRenderableImage = Boolean(currentPhoto) && !imageError;

  const findNextAvailablePhotoIndex = (startIndex: number) => {
    if (photos.length <= 1) return -1;

    for (let offset = 1; offset <= photos.length; offset += 1) {
      const nextIndex = (startIndex + offset) % photos.length;
      const nextPhoto = photos[nextIndex];
      if (nextPhoto && !failedPhotos.has(nextPhoto)) return nextIndex;
    }

    return -1;
  };

  const next = () => {
    setImageError(false);
    setPhotoIdx((i) => {
      const nextIndex = findNextAvailablePhotoIndex(i);
      return nextIndex === -1 ? i : nextIndex;
    });
  };
  const prev = () => {
    setImageError(false);
    setPhotoIdx((i) => {
      if (photos.length <= 1) return i;

      for (let offset = 1; offset <= photos.length; offset += 1) {
        const prevIndex = (i - offset + photos.length) % photos.length;
        const prevPhoto = photos[prevIndex];
        if (prevPhoto && !failedPhotos.has(prevPhoto)) return prevIndex;
      }

      return i;
    });
  };
  const hasAnyPhoto = photos.length > 0;
  const sourceLinks = product.sourceLinks || [];
  const sourceTiles = product.sourceTiles || [];
  const specs = Object.entries(product.specifications || {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <>
          {(onPrev || onNext) && (
            <>
              {onPrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  className="absolute left-2 sm:left-3 top-auto sm:top-1/2 bottom-4 sm:bottom-auto sm:-translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              {onNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-2 sm:right-3 top-auto sm:top-1/2 bottom-4 sm:bottom-auto sm:-translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Next product"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}
            </>
          )}

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="relative w-full max-w-5xl max-h-[92vh] h-auto bg-background rounded-xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-card/90 border border-border flex items-center justify-center hover:bg-card transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`${hasAnyPhoto && hasRenderableImage ? "grid lg:grid-cols-[45%_55%] overflow-y-auto lg:overflow-hidden lg:h-[min(90vh,900px)]" : "overflow-y-auto lg:h-[min(90vh,900px)]"}`}
            >
              {/* Details */}
              {hasAnyPhoto && hasRenderableImage && (
                <div className="relative min-h-[220px] md:min-h-[320px] lg:h-full bg-muted/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentPhoto}
                    alt={product.name || "Product image"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-4 sm:p-6"
                    onError={() => {
                      setFailedPhotos((prev) => {
                        const next = new Set(prev).add(currentPhoto);
                        return next;
                      });

                      const nextIndex = findNextAvailablePhotoIndex(photoIdx);
                      if (nextIndex === -1) {
                        setImageError(true);
                        onImageUnavailable?.(product.id);
                        return;
                      }

                      setImageError(false);
                      setPhotoIdx(nextIndex);
                    }}
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-card/80 border border-border rounded-full px-3 py-1.5 backdrop-blur">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setImageError(false);
                              setPhotoIdx(i);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? "bg-primary w-6" : "bg-muted-foreground/40"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Details */}
              <div
                className={`p-5 sm:p-8 flex flex-col gap-5 min-h-0 overflow-y-auto max-h-[65vh] sm:max-h-[72vh] lg:overflow-y-auto lg:max-h-none ${hasAnyPhoto && hasRenderableImage ? "" : "w-full"}`}
              >
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.subType && (
                      <span className="rounded-full bg-muted text-foreground px-3 py-1 text-[11px] font-semibold">
                        {product.subType}
                      </span>
                    )}
                    {product.brand && (
                      <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-[11px] font-semibold">
                        {product.brand}
                      </span>
                    )}
                    {product.source && (
                      <span className="rounded-full bg-muted/60 text-muted-foreground border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                        via {product.source}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {product.name}
                  </h2>
                </div>

                <div className="rounded-2xl bg-muted/40 border border-border p-4 flex items-end justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Price
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatPrice(product)}
                    </p>
                  </div>
                  {product.moq && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        MOQ
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {product.moq} {product.moqUnit || ""}
                      </p>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                )}

                {product.buyerPersona && (
                  <div className="rounded-2xl bg-secondary/8 border border-secondary/20 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-secondary font-bold mb-1.5">
                      Ideal for
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {product.buyerPersona}
                    </p>
                  </div>
                )}

                {/* B2B Attributes */}
                <div className="grid grid-cols-2 gap-3">
                  {product.hsnCode && (
                    <Attr
                      icon={<Tag className="w-3.5 h-3.5" />}
                      label="HSN"
                      value={product.hsnCode}
                    />
                  )}
                  {product.gstPercent != null && (
                    <Attr
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                      label="GST"
                      value={`${product.gstPercent}%`}
                    />
                  )}
                  {product.countryOfOrigin && (
                    <Attr
                      icon={<Globe2 className="w-3.5 h-3.5" />}
                      label="Origin"
                      value={product.countryOfOrigin}
                    />
                  )}
                  {product.brand && (
                    <Attr
                      icon={<Package className="w-3.5 h-3.5" />}
                      label="Brand"
                      value={product.brand}
                    />
                  )}
                </div>

                {/* Specifications */}
                {specs.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      Specifications
                    </p>
                    <div className="rounded-2xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map(([k, v], i) => (
                            <tr
                              key={k}
                              className={i % 2 === 0 ? "bg-muted/30" : ""}
                            >
                              <td className="px-3 py-2 font-semibold text-foreground capitalize w-1/2">
                                {k.replace(/_/g, " ")}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {String(v)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground uppercase font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(sourceLinks.length > 0 || sourceTiles.length > 0) && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      Source verified from:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sourceLinks.map((source) => (
                        <a
                          key={`${source.label}-${source.url}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors capitalize"
                          title={`Open ${source.label}`}
                        >
                          {productSourceIcon(source.platform)} {source.label}{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {sourceLinks.length === 0 &&
                        sourceTiles.map((tile) => (
                          <span
                            key={`${tile.key}-${tile.label}`}
                            className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                          >
                            {tile.label}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={enquireHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Enquire about this
                    product
                  </a>
                  {product.sourceUrl && (
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <ExternalLink className="w-4 h-4" /> View source
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      </motion.div>
    </AnimatePresence>
  );
}

function Attr({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
