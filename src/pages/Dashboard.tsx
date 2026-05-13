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
  Hash,
  Search,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ParticlesBackground from "@/components/seller/ParticlesBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type SellerCatalogSummary,
  listAvailableSellerCatalogs,
} from "@/lib/sellerDataLoader";

const sellerCatalogsQueryKey = ["sellerCatalogs"] as const;
const SplashCursor = lazy(() => import("@/components/seller/SplashCursor"));

const Dashboard = () => {
  const { data: catalogs = [], isPending: isLoading } = useQuery({
    queryKey: sellerCatalogsQueryKey,
    queryFn: listAvailableSellerCatalogs,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleOpenCatalog = (catalogId: string) => {
    if (isMobile) {
      // Open in same tab on mobile
      navigate(`/${catalogId}`);
    } else {
      // Open in new tab on desktop
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(243,244,246,0.95)_40%,_rgba(229,231,235,1))] text-foreground relative">
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
          RAINBOW_MODE={true}
          COLOR="#B4EBE6"
          BACK_COLOR={{ r: 0, g: 0, b: 0.5 }}
        />
      </Suspense>
      <ParticlesBackground variant="dashboard" className="z-0 opacity-100" />
      <div className="mx-auto relative z-10 flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 rounded-[2rem] border border-border/70 bg-white/75 p-6 shadow-[0_20px_80px_-32px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:p-8"
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
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Pick a seller catalog to open.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  This landing page lists every available seller ID in the data
                  folder. Open any catalog directly by clicking its card, or
                  visit the seller-specific URL in the browser.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <Store className="h-4 w-4" />
                  Total Catalogs
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">
                  {isLoading ? "—" : catalogs.length}
                </div>
              </div>
              <div
                ref={searchRef}
                className="relative rounded-2xl border border-border/70 bg-white px-4 py-3 shadow-sm flex items-center"
              >
                <Search className="absolute left-6 h-4 w-4 text-slate-400" />
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
                  className="w-full pl-12 rounded-2xl border-0 bg-transparent text-slate-950 placeholder-slate-400 focus:ring-0"
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
                          className="max-h-56 overflow-auto rounded-xl border border-border bg-white shadow-lg"
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
                                className={`block w-full text-left px-4 py-3 ${selectedIndex === idx ? "bg-muted/30" : "hover:bg-muted/40"}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setShowSuggestions(false);
                                  handleOpenCatalog(catalog.id);
                                }}
                                onMouseEnter={() => setSelectedIndex(idx)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-slate-950">
                                    {catalog.sellerName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {catalog.id}
                                  </div>
                                </div>
                                {catalog.description && (
                                  <div className="mt-1 text-xs text-slate-600 line-clamp-2">
                                    {catalog.description}
                                  </div>
                                )}
                              </button>
                            </div>
                          ))}
                          {filteredCatalogs.length === 0 && (
                            <div className="p-4 text-sm text-slate-600">
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
                  className="h-64 animate-pulse rounded-[1.75rem] border border-border/70 bg-white/70"
                />
              ))}
            </div>
          ) : catalogs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-950">
                No seller catalogs found
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Add a seller JSON file to{" "}
                <span className="font-medium text-slate-900">src/data</span> and
                it will appear here automatically.
              </p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/80 bg-white/70 p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-950">
                No catalogs match your search
              </h2>
              <p className="mt-2 text-sm text-slate-600">
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
                  <Card className="group flex flex-col h-64 overflow-hidden border-border/70 bg-white/80 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(15,23,42,0.36)]">
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-lg shadow-slate-950/10 flex-shrink-0">
                          <BookOpenText className="h-4 w-4" />
                          {/* <Hash className="h-4 w-4" /> */}
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 flex-shrink-0"
                        >
                          {catalog.id}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <CardTitle className="text-base text-slate-950 line-clamp-2">
                          {catalog.sellerName}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-600 line-clamp-2">
                          {catalog.description ||
                            "Seller catalog available in the data folder."}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                      <Button
                        onClick={() => handleOpenCatalog(catalog.id)}
                        className="w-full rounded-xl bg-slate-950 text-white text-xs hover:bg-slate-800"
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
