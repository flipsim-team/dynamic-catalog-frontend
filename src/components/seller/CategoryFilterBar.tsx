import { motion } from "framer-motion";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SourceOption {
  key: string;
  label: string;
  count: number;
}

interface Props {
  categories: { name: string; count: number }[];
  sources?: SourceOption[];
  active: string;
  onChange: (cat: string) => void;
  selectedSources?: string[];
  onSourceToggle?: (sourceKey: string) => void;
  onClearSources?: () => void;
  totalCount: number;
}

export default function CategoryFilterBar({
  categories,
  sources = [],
  active,
  onChange,
  selectedSources = [],
  onSourceToggle,
  onClearSources,
  totalCount,
}: Props) {
  const allCategories = [{ name: "All", count: totalCount }, ...categories];
  const sourceMap = new Map(sources.map((source) => [source.key, source]));
  const hasSelectedSources = selectedSources.length > 0;

  return (
    <div className="space-y-4 lg:flex lg:items-start lg:gap-4 lg:space-y-0">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Category
        </p>
        <div className="-mx-4 overflow-x-auto p-1 sm:mx-0 scrollbar-thin">
          <div className="flex min-w-max gap-2 px-4 sm:px-0">
            {allCategories.map((category) => {
              const isActive = active === category.name;
              const isEmpty = category.count === 0 && category.name !== "All";
              return (
                <motion.button
                  key={category.name}
                  type="button"
                  onClick={() => onChange(category.name)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isEmpty
                        ? "border-border/70 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {category.name.toLocaleUpperCase()}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : isEmpty
                          ? "bg-muted/60 text-muted-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {category.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {onSourceToggle && sources.length > 0 && (
        <div className="w-full lg:w-[20rem] xl:w-[22rem]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Source
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ y: -1 }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                  aria-label="Open source filter"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter sources</span>
                  <span className="sm:hidden">Source</span>
                  {hasSelectedSources && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {selectedSources.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[min(92vw,22rem)] border-border bg-card p-3 shadow-2xl"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Filter by source
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select one or more sources to narrow the catalog.
                    </p>
                  </div>
                  {hasSelectedSources && onClearSources && (
                    <button
                      type="button"
                      onClick={onClearSources}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  <div className="space-y-2">
                    {sources.map((source) => {
                      const isActive = selectedSources.includes(source.key);
                      return (
                        <button
                          key={source.key}
                          type="button"
                          onClick={() => onSourceToggle(source.key)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                            isActive
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/35 hover:bg-muted/40"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {source.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              {source.count} products
                            </span>
                          </span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${
                              isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {isActive ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              source.count
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {hasSelectedSources && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSources.map((sourceKey) => {
                const option = sourceMap.get(sourceKey);
                if (!option) return null;
                return (
                  <motion.div
                    key={sourceKey}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    <span className="max-w-[11rem] truncate">
                      {option.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSourceToggle(sourceKey)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      aria-label={`Remove ${option.label} filter`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
