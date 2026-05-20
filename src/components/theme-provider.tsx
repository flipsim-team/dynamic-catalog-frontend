import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type NextThemesProviderProps = ComponentProps<typeof NextThemesProvider>;

// Thin wrapper so the app can centralize next-themes configuration at one import site.
export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
