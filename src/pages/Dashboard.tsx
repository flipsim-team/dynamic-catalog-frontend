/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, lazy, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookDashedIcon,
  BookOpenText,
  Building2,
  Check,
  Clipboard,
  Hash,
  Search,
  Store,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";
import ParticlesBackground from "@/components/seller/ParticlesBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { getSupabaseClient, SupabaseConfigError } from "@/lib/supabaseClient";

type SellerCatalogSummary = {
  id: string;
  sellerName: string;
  description?: string;
};

const sellerCatalogsQueryKey = ["sellerCatalogs"] as const;
const SplashCursor = lazy(() => import("@/components/seller/SplashCursor"));

// 1. Fetch the dashboard catalog list from Supabase so the page can show every catalog card.
async function fetchSellerCatalogs() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("glid_data")
    .select("glid, company_name, company_desc");

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: String(item.glid ?? "").trim(),
    sellerName: String(item.company_name ?? "Seller").trim() || "Seller",
    description: String(item.company_desc ?? "").trim() || undefined,
  }));
}

const copyWithExecCommandFallback = (text: string): boolean => {
  if (typeof document === "undefined") return false;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);
  return copied;
};

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to legacy fallback for browsers/devices that block Clipboard API.
    }
  }

  return copyWithExecCommandFallback(text);
};

const Dashboard = () => {
  // 2. Cache the Supabase-backed list so search, counters, and cards all read from the same source.
  const {
    data: catalogs = [],
    isPending: isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: sellerCatalogsQueryKey,
    queryFn: fetchSellerCatalogs,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedCatalogId, setCopiedCatalogId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const copiedResetTimer = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleOpenCatalog = (catalogId: string) => {
    if (isMobile) {
      // 3. Use the GLID from Supabase to navigate to the seller detail route on mobile.
      navigate(`/${catalogId}`);
    } else {
      // 3. Use the same GLID to open the seller detail route in a new desktop tab.
      const baseUrl = window.location.origin;
      window.open(`${baseUrl}/${catalogId}`, "_blank");
    }
  };

  useEffect(() => {
    if (!showSuggestions) setSelectedIndex(-1);
  }, [showSuggestions]);

  useEffect(() => {
    document.title = "Seller Catalog Dashboard";
  }, []);

  useEffect(() => {
    return () => {
      if (copiedResetTimer.current) {
        window.clearTimeout(copiedResetTimer.current);
      }
    };
  }, []);

  const handleCopySellerId = async (catalogId: string) => {
    const didCopy = await copyTextToClipboard(catalogId);
    if (!didCopy) return;

    setCopiedCatalogId(catalogId);
    if (copiedResetTimer.current) {
      window.clearTimeout(copiedResetTimer.current);
    }
    copiedResetTimer.current = window.setTimeout(() => {
      setCopiedCatalogId((current) => (current === catalogId ? null : current));
    }, 2000);
  };

  // 4. Filter the already-fetched Supabase rows locally for search and quick card rendering.
  const filteredCatalogs = catalogs.filter((catalog) => {
    const query = searchQuery.toLowerCase();
    return (
      catalog.id.toLowerCase().includes(query) ||
      catalog.sellerName.toLowerCase().includes(query)
    );
  });

  // clamp selectedIndex when results change
  useEffect(() => {
    const len = Math.min(filteredCatalogs.length, 8);
    if (len === 0) {
      setSelectedIndex(-1);
      return;
    }
    if (selectedIndex >= len) setSelectedIndex(len - 1);
  }, [filteredCatalogs.length]);

  // scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex < 0) return;
    const el = document.getElementById(`suggestion-${selectedIndex}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  function SuggestionsPortal({ children }: { children: React.ReactNode }) {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
  }

  if (isError && error instanceof SupabaseConfigError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Supabase is not configured</h1>
          <p className="text-muted-foreground">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your
            environment file, then restart the app.
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">
            Unable to load seller catalogs
          </h1>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "The request failed. Check your network connection, Supabase auth, and RLS policies."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--background)/0.9),_hsl(var(--brand-section-alt)/0.95)_40%,_hsl(var(--card)))] text-foreground relative dark:text-slate-100">
      <div className="fixed right-4 top-4 z-[70] flex items-center gap-3">
        <ThemeToggle />
      </div>
      {!isMobile && (
        <Suspense fallback={null}>
          <SplashCursor
            SIM_RESOLUTION={128}
            DYE_RESOLUTION={1440}
            CAPTURE_RESOLUTION={512}
            DENSITY_DISSIPATION={4.5}
            VELOCITY_DISSIPATION={2}
            PRESSURE={0.1}
            PRESSURE_ITERATIONS={20}
            CURL={3}
            SPLAT_RADIUS={0.12}
            SPLAT_FORCE={1600}
            SHADING={false}
            COLOR_UPDATE_SPEED={12}
            TRANSPARENT
            RAINBOW_MODE={false}
            COLOR="#B4EBE6"
            BACK_COLOR={{ r: 0, g: 0, b: 0.5 }}
          />
        </Suspense>
      )}
      <ParticlesBackground variant="dashboard" className="z-0 opacity-100" />
      <div className="mx-auto relative z-10 flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 rounded-[2rem] border border-border/70 bg-white/75 p-6 shadow-[0_20px_80px_-32px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-card/70 dark:shadow-[0_20px_80px_-32px_rgba(0,0,0,0.6)]"
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
              >
                Seller Catalog Index
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-slate-50">
                  Pick a seller catalog to open.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                  This landing page lists every available seller catalog from
                  Supabase. Open any catalog directly by clicking its card, or
                  visit the seller-specific URL in the browser.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-card/70">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <Store className="h-4 w-4" />
                  Total Catalogs
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {isLoading ? "—" : catalogs.length}
                </div>
              </div>
              <div
                ref={searchRef}
                className="relative flex items-center rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-card/70"
              >
                <Search className="absolute left-6 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search by seller ID or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 120)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    const len = Math.min(filteredCatalogs.length, 8);
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!showSuggestions) {
                        if (len > 0) {
                          setSelectedIndex(0);
                          setShowSuggestions(true);
                        }
                        return;
                      }
                      if (len === 0) return;
                      setSelectedIndex((i) => (i + 1 + len) % len);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (!showSuggestions) return;
                      if (len === 0) return;
                      setSelectedIndex((i) => (i - 1 + len) % len);
                    } else if (e.key === "Enter") {
                      if (!showSuggestions) return;
                      e.preventDefault();
                      if (selectedIndex >= 0 && selectedIndex < len) {
                        const id = filteredCatalogs[selectedIndex].id;
                        setShowSuggestions(false);
                        handleOpenCatalog(id);
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  className="w-full rounded-2xl border-0 bg-transparent pl-12 text-slate-950 placeholder-slate-400 focus:ring-0 dark:text-slate-50 dark:placeholder-slate-500"
                />
                {showSuggestions && searchQuery.trim().length > 0 && (
                  <SuggestionsPortal>
                    {(() => {
                      const rect = searchRef.current?.getBoundingClientRect();
                      if (!rect || typeof document === "undefined") return null;
                      const style: React.CSSProperties = {
                        position: "absolute",
                        left: rect.left + window.scrollX,
                        top: rect.bottom + window.scrollY + 12,
                        width: rect.width,
                        zIndex: 9999,
                      };

                      return (
                        <div
                          style={style}
                          className="max-h-56 overflow-auto rounded-xl border border-border bg-white shadow-lg dark:border-white/10 dark:bg-card"
                          role="listbox"
                        >
                          {filteredCatalogs.slice(0, 8).map((catalog, idx) => (
                            <div
                              key={catalog.id}
                              id={`suggestion-${idx}`}
                              role="option"
                              aria-selected={selectedIndex === idx}
                            >
                              <button
                                type="button"
                                className={`block w-full text-left px-4 py-3 ${selectedIndex === idx ? "bg-muted/30 dark:bg-white/5" : "hover:bg-muted/40 dark:hover:bg-white/5"}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setShowSuggestions(false);
                                  handleOpenCatalog(catalog.id);
                                }}
                                onMouseEnter={() => setSelectedIndex(idx)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-950 dark:text-slate-50">
                                    {catalog.sellerName}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {catalog.id}
                                  </div>
                                </div>
                                {catalog.description && (
                                  <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                    {catalog.description}
                                  </div>
                                )}
                              </button>
                            </div>
                          ))}
                          {filteredCatalogs.length === 0 && (
                            <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                              No matches
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </SuggestionsPortal>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-[1.75rem] border border-border/70 bg-white/70 dark:border-white/10 dark:bg-card/60"
                />
              ))}
            </div>
          ) : catalogs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-card/60">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                No seller catalogs found
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                No catalogs were returned from Supabase for this query.
              </p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-card/60">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                No catalogs match your search
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Try searching with a different seller ID or name.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCatalogs.map((catalog, index) => (
                <motion.div
                  key={catalog.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                >
                  <Card className="group flex h-64 flex-col overflow-hidden border-border/70 bg-white/80 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-card/70 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.5)]">
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-shrink-0 rounded-2xl bg-slate-950 p-2.5 text-white shadow-lg shadow-slate-950/10 dark:bg-slate-800 dark:shadow-black/20">
                          <BookOpenText className="h-4 w-4" />
                          {/* <Hash className="h-4 w-4" /> */}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void handleCopySellerId(catalog.id);
                          }}
                          aria-label={`Copy seller ID ${catalog.id}`}
                          title={
                            copiedCatalogId === catalog.id
                              ? "Copied"
                              : "Copy seller ID"
                          }
                          className={cn(
                            badgeVariants({ variant: "outline" }),
                            "flex flex-shrink-0 items-center gap-1.5 rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
                          )}
                        >
                          <span>{catalog.id}</span>
                          {copiedCatalogId === catalog.id ? (
                            <Check className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <Clipboard className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <CardTitle className="text-base text-slate-950 line-clamp-2 dark:text-slate-50">
                          {catalog.sellerName}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                          {catalog.description ||
                            "Seller catalog available from Supabase."}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <Button
                        onClick={() => handleOpenCatalog(catalog.id)}
                        className="w-full rounded-xl bg-slate-950 text-xs text-white hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                      >
                        Open catalog
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
