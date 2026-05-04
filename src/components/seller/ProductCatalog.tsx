import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ShoppingBag, MessageCircle, Eye } from "lucide-react";
import CategoryFilterBar from "./CategoryFilterBar";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import type { SellerData, CatalogProduct } from "@/lib/sellerDataExtractor";

function normalizeSourceLabel(source: string) {
  const key = String(source || "")
    .trim()
    .toLowerCase();
  if (key === "youtube") return "YouTube";
  if (key === "instagram") return "Instagram";
  if (key === "facebook") return "Facebook";
  if (key === "linkedin") return "LinkedIn";
  if (key === "twitter") return "Twitter/X";
  if (key === "whatsapp") return "WhatsApp";
  if (key === "website") return "Website";
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : "Source";
}

type SourceFilterOption = {
  key: string;
  label: string;
  count: number;
};

function normalizeSourceKey(source: string) {
  return String(source || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function collectProductSourceEntries(product: CatalogProduct) {
  const entries: SourceFilterOption[] = [];
  const addEntry = (key: string, label: string) => {
    const normalizedKey = normalizeSourceKey(key);
    const normalizedLabel = String(label || "").trim();
    if (!normalizedKey || !normalizedLabel) return;
    entries.push({ key: normalizedKey, label: normalizedLabel, count: 1 });
  };

  const primarySource = String(product.source || "").trim();
  if (primarySource) {
    addEntry(primarySource, normalizeSourceLabel(primarySource));
  }

  for (const tile of product.sourceTiles || []) {
    addEntry(tile.key, tile.label);
  }

  for (const link of product.sourceLinks || []) {
    const linkKey = link.platform
      ? normalizeSourceKey(link.platform)
      : normalizeSourceKey(link.label || link.url);
    const linkLabel = link.platform
      ? normalizeSourceLabel(link.platform)
      : link.label || normalizeSourceLabel(linkKey);
    addEntry(linkKey, linkLabel);
  }

  return entries;
}

function productMatchesSelectedSources(
  product: CatalogProduct,
  selectedSources: string[],
) {
  if (selectedSources.length === 0) return true;
  const productSources = new Set(
    collectProductSourceEntries(product).map((entry) => entry.key),
  );
  return selectedSources.some((source) => productSources.has(source));
}

export default function ProductCatalog({ data }: { data: SellerData }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.04 });
  const [activeCat, setActiveCat] = useState<string>("All");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [showNoImageProducts, setShowNoImageProducts] = useState(false);
  const [brokenImageProductIds, setBrokenImageProductIds] = useState<
    Set<string>
  >(() => new Set());

  const markImageUnavailable = useCallback((productId: string) => {
    setBrokenImageProductIds((prev) => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  const toggleSource = useCallback((sourceKey: string) => {
    const normalizedSource = normalizeSourceKey(sourceKey);
    if (!normalizedSource) return;
    setSelectedSources((current) =>
      current.includes(normalizedSource)
        ? current.filter((source) => source !== normalizedSource)
        : [...current, normalizedSource],
    );
  }, []);

  const clearSelectedSources = useCallback(() => {
    setSelectedSources([]);
  }, []);

  const sourceFilters = useMemo<SourceFilterOption[]>(() => {
    const counts = new Map<string, { label: string; count: number }>();

    for (const product of data.products) {
      const seenKeys = new Set<string>();
      for (const entry of collectProductSourceEntries(product)) {
        if (seenKeys.has(entry.key)) continue;
        seenKeys.add(entry.key);

        const existing = counts.get(entry.key);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(entry.key, { label: entry.label, count: 1 });
        }
      }
    }

    return Array.from(counts.entries())
      .map(([key, value]) => ({
        name: key,
        key,
        label: value.label,
        count: value.count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data.products]);

  const sourceFilteredProducts = useMemo(() => {
    if (selectedSources.length === 0) return data.products;
    return data.products.filter((product) =>
      productMatchesSelectedSources(product, selectedSources),
    );
  }, [data.products, selectedSources]);

  const categoryCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of sourceFilteredProducts) {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    }
    return counts;
  }, [sourceFilteredProducts]);

  const categoryFilters = useMemo(
    () =>
      data.categories.map((category) => ({
        ...category,
        count: categoryCountMap.get(category.name) || 0,
      })),
    [categoryCountMap, data.categories],
  );

  const filtered = useMemo(() => {
    return sourceFilteredProducts.filter((product) => {
      return activeCat === "All" || product.category === activeCat;
    });
  }, [activeCat, sourceFilteredProducts]);

  const withImageProducts = useMemo(
    () =>
      filtered.filter(
        (product) =>
          Boolean(product.primaryPhoto) &&
          !brokenImageProductIds.has(product.id),
      ),
    [brokenImageProductIds, filtered],
  );
  const withoutImageProducts = useMemo(
    () =>
      filtered.filter(
        (product) =>
          !product.primaryPhoto || brokenImageProductIds.has(product.id),
      ),
    [brokenImageProductIds, filtered],
  );

  const displayedProducts = useMemo(() => {
    const arr = [...withImageProducts];
    if (showNoImageProducts) arr.push(...withoutImageProducts);
    return arr;
  }, [withImageProducts, withoutImageProducts, showNoImageProducts]);

  useEffect(() => {
    setShowNoImageProducts(false);
  }, [activeCat]);

  useEffect(() => {
    setShowNoImageProducts(false);
  }, [selectedSources]);

  if (!data.products.length) return null;

  const enquireBase = data.whatsappUrl
    ? `${data.whatsappUrl}${data.whatsappUrl.includes("?") ? "&" : "?"}text=`
    : data.primaryPhone
      ? `https://wa.me/91${data.primaryPhone}?text=`
      : "";

  const fallbackHref = data.email
    ? `mailto:${data.email}?subject=Product%20Enquiry`
    : data.primaryPhone
      ? `tel:${data.primaryPhone}`
      : "";

  const enquireAll = enquireBase
    ? `${enquireBase}${encodeURIComponent(`Hi ${data.sellerName}, I'm interested in your product range. Please share more details.`)}`
    : fallbackHref;

  const enquireFor = (p: CatalogProduct) =>
    enquireBase
      ? `${enquireBase}${encodeURIComponent(`Hi ${data.sellerName}, I would like to enquire about: ${p.name}`)}`
      : data.email
        ? `mailto:${data.email}?subject=Enquiry: ${encodeURIComponent(p.name)}`
        : data.primaryPhone
          ? `tel:${data.primaryPhone}`
          : "";

  return (
    <section
      id="products"
      ref={ref}
      className="py-20 sm:py-28 bg-background relative overflow-hidden"
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.04),transparent_40%),radial-gradient(circle_at_90%_80%,hsl(var(--accent)/0.05),transparent_40%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Our Products
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">
              Showing {data.showcasedItems} products across{" "}
              {data.categories.length} categories. Tap any product for full
              specifications.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {enquireAll && (
              <a
                href={enquireAll}
                target={enquireAll.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" /> Enquire About All Products
              </a>
            )}
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          id="categories"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <CategoryFilterBar
            categories={categoryFilters}
            sources={sourceFilters}
            active={activeCat}
            onChange={setActiveCat}
            selectedSources={selectedSources}
            onSourceToggle={toggleSource}
            onClearSources={clearSelectedSources}
            totalCount={sourceFilteredProducts.length}
          />
        </motion.div>

        {/* Grid: products with images */}
        <div className="product-grid">
          {withImageProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={() => setSelected(p)}
              enquireHref={enquireFor(p)}
              onImageUnavailable={markImageUnavailable}
            />
          ))}
        </div>

        {withoutImageProducts.length > 0 && (
          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Products Without Images
            </p>

            {!showNoImageProducts && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                onClick={() => setShowNoImageProducts(true)}
                className="w-full rounded-2xl border border-dashed border-border bg-card p-6 text-left shadow-sm hover:shadow-lg hover:border-primary/35 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-bold text-foreground">
                  Show {withoutImageProducts.length} more products
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These items are listed separately because product images are
                  unavailable.
                </p>
              </motion.button>
            )}

            {showNoImageProducts && (
              <div className="product-grid">
                {withoutImageProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpen={() => setSelected(p)}
                    enquireHref={enquireFor(p)}
                    hideImageSection
                    onImageUnavailable={markImageUnavailable}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {withImageProducts.length === 0 &&
          withoutImageProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No products in this category.
            </p>
          )}
      </div>

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        enquireHref={selected ? enquireFor(selected) : ""}
        onImageUnavailable={markImageUnavailable}
        onPrev={
          selected
            ? () => {
                const idx = displayedProducts.findIndex(
                  (p) => p.id === selected.id,
                );
                if (idx !== -1 && displayedProducts.length > 0) {
                  const prev =
                    displayedProducts[
                      (idx - 1 + displayedProducts.length) %
                        displayedProducts.length
                    ];
                  setSelected(prev);
                }
              }
            : undefined
        }
        onNext={
          selected
            ? () => {
                const idx = displayedProducts.findIndex(
                  (p) => p.id === selected.id,
                );
                if (idx !== -1 && displayedProducts.length > 0) {
                  const next =
                    displayedProducts[(idx + 1) % displayedProducts.length];
                  setSelected(next);
                }
              }
            : undefined
        }
      />
    </section>
  );
}
