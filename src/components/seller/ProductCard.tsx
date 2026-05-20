import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { type CatalogProduct, formatPrice } from "@/lib/sellerDataExtractor";

interface Props {
  product: CatalogProduct;
  onOpen: () => void;
  enquireHref: string;
  hideImageSection?: boolean;
  onImageUnavailable?: (productId: string) => void;
}

// Compact product tile used in the catalog grid and fallback image-only listings.
export default function ProductCard({
  product,
  onOpen,
  enquireHref,
  hideImageSection = false,
  onImageUnavailable,
}: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const sourceTiles = product.sourceTiles.slice(0, 6);
  const showImageSection = Boolean(product.primaryPhoto) && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onClick={onOpen}
      className="group cursor-pointer rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
    >
      {showImageSection && !hideImageSection && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={product.primaryPhoto}
            alt={product.name}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              onImageUnavailable?.(product.id);
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-start justify-between gap-2 pointer-events-none">
            {product.inStock && (
              <span className="inline-flex max-w-full min-w-[88px] items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">In stock</span>
              </span>
            )}
            <span className="rounded-full bg-card/90 backdrop-blur border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground max-w-[70%] truncate">
              {product.category}
            </span>
          </div>
          {(product.source || sourceTiles.length > 0) && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-start pointer-events-none">
              <div className="max-w-full overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 min-w-max pr-2">
                  {/* {product.source && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      via {product.source}
                    </span>
                  )} */}
                  {sourceTiles.map((tile) => (
                    <span
                      key={`${product.id}-${tile.key}`}
                      className="inline-flex items-center rounded-full bg-card/90 backdrop-blur border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase tracking-wider"
                      title={tile.label}
                    >
                      {tile.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-bold text-foreground leading-snug line-clamp-2 min-h-[2.6em]">
          {product.name}
        </h3>

        {hideImageSection && (product.source || sourceTiles.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {sourceTiles.map((tile) => (
              <span
                key={`${product.id}-${tile.key}`}
                className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground"
                title={tile.label}
              >
                {tile.label}
              </span>
            ))}
          </div>
        )}

        {product.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {product.description.length > 110
              ? product.description.slice(0, 110) + "…"
              : product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider rounded-md bg-muted px-2 py-0.5 text-muted-foreground font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* {sourceTiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sourceTiles.map((tile) => (
              <span
                key={`${product.id}-${tile.key}`}
                className="text-[10px] uppercase tracking-wider rounded-md border border-border bg-background px-2 py-0.5 text-muted-foreground font-semibold"
                title={tile.label}
              >
                {tile.label}
              </span>
            ))}
          </div>
        )} */}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Price
            </p>
            <p className="font-bold text-foreground text-sm leading-tight">
              {formatPrice(product)}
            </p>
          </div>
          <a
            href={enquireHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3.5 py-2 text-xs font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Enquire
          </a>
        </div>
      </div>
    </motion.article>
  );
}
