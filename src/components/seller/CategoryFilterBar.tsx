import { motion } from "framer-motion";

interface Props {
  categories: { name: string; count: number }[];
  sources?: { name: string; count: number }[];
  active: string;
  onChange: (cat: string) => void;
  activeSource?: string;
  onSourceChange?: (source: string) => void;
  totalCount: number;
}

export default function CategoryFilterBar({
  categories,
  sources = [],
  active,
  onChange,
  activeSource = "All",
  onSourceChange,
  totalCount,
}: Props) {
  const allCategories = [{ name: "All", count: totalCount }, ...categories];
  const allSources = [{ name: "All", count: totalCount }, ...sources];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Category
        </p>
        <div className="-mx-4 overflow-x-auto p-1 sm:mx-0 scrollbar-thin">
          <div className="flex min-w-max gap-2 px-4 sm:px-0">
            {allCategories.map((category) => {
              const isActive = active === category.name;
              return (
                <motion.button
                  key={category.name}
                  onClick={() => onChange(category.name)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {category.name.toLocaleUpperCase()}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
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

      {onSourceChange && sources.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Source
          </p>
          <div className="-mx-4 overflow-x-auto p-1 sm:mx-0 scrollbar-thin">
            <div className="flex min-w-max gap-2 px-4 sm:px-0">
              {allSources.map((source) => {
                const isActive = activeSource === source.name;
                return (
                  <motion.button
                    key={source.name}
                    onClick={() => onSourceChange(source.name)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "border-foreground bg-foreground text-background shadow-md"
                        : "border-border bg-card text-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {source.name.toLocaleUpperCase()}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? "bg-background/15 text-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {source.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
