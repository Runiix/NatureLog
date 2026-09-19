"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { type ResolvedTheme, type Theme, writeThemeCookie } from "./theme";

type ThemeContextValue = {
  /** The stored preference. */
  theme: Theme;
  /** What is actually showing; follows the OS while theme is "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

// The server cannot see the OS setting; the head script covers first paint.
const serverSystemTheme = (): ResolvedTheme => "light";

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/**
 * Owns the theme preference on the client. The server has already put the
 * right class on <html> (or the head script has, for "system"), so this never
 * changes the first paint — it only handles later changes: an explicit choice
 * via setTheme, or the OS flipping while the preference is "system".
 */
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const osTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    systemTheme,
    serverSystemTheme,
  );
  const resolvedTheme: ResolvedTheme = theme === "system" ? osTheme : theme;

  useEffect(() => {
    // Read the OS directly rather than using resolvedTheme: while hydrating,
    // useSyncExternalStore reports the server snapshot ("light"), and applying
    // that would strip the class the head script just set — a visible flash.
    applyTheme(theme === "system" ? systemTheme() : theme);
  }, [theme, osTheme]);

  const setTheme = useCallback((next: Theme) => {
    writeThemeCookie(next);
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
