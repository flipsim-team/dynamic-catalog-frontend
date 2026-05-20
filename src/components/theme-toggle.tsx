import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "rounded-full border p-2 backdrop-blur-2xl",
        isDark
          ? "border-white/10 bg-slate-950/35 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_0_30px_rgba(56,189,248,0.22),0_0_60px_rgba(14,165,233,0.12)]"
          : "border-border/70 bg-background/85 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.45)]",
        className,
      )}
      style={{ transform: "scale(0.8)" }}
    >
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 transition-opacity",
            isDark
              ? "opacity-100 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              : "opacity-100 text-amber-500",
          )}
          aria-hidden
        >
          <SunMedium className="h-3.5 w-3.5" />
        </span>

        <span
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 transition-opacity",
            isDark
              ? "opacity-100 text-sky-200 drop-shadow-[0_0_10px_rgba(186,230,253,0.85)]"
              : "opacity-35 text-slate-500",
          )}
          aria-hidden
        >
          <MoonStar className="h-3.5 w-3.5" />
        </span>

        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          className={cn(
            "h-8 w-16 border border-white/10 px-1.5 transition-all duration-300",
            isDark
              ? "bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(56,189,248,0.18)] data-[state=checked]:bg-slate-900/70 data-[state=unchecked]:bg-slate-900/55"
              : "bg-amber-200/90 data-[state=checked]:bg-slate-950 data-[state=unchecked]:bg-amber-200/90",
            "data-[state=checked]:[&>span]:translate-x-8 data-[state=unchecked]:[&>span]:translate-x-0",
            "[&>span]:relative [&>span]:z-20 [&>span]:h-6 [&>span]:w-6 [&>span]:border [&>span]:border-white/20 [&>span]:bg-background [&>span]:shadow-[0_0_14px_rgba(255,255,255,0.12)]",
          )}
        />
      </div>
    </div>
  );
}
