export const THEME_COOKIE = "theme";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<Theme, "system">;

/** The cookie is client-writable, so anything unexpected means "system". */
export function parseTheme(value: string | undefined | null): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "system";
}

/**
 * Runs in <head> before first paint, only when the server could not decide the
 * theme itself (no explicit choice in the cookie). Kept tiny and dependency-free
 * because it is inlined into every such HTML response.
 *
 * It must be allowed by the CSP: `script-src` currently carries
 * 'unsafe-inline' and no nonce. If a nonce is ever added, 'unsafe-inline' is
 * ignored per spec and this script needs the nonce too.
 */
export const SYSTEM_THEME_SCRIPT = `(function(){try{if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.classList.add("dark")}}catch(e){}})();`;

/** Writes the preference; one year, readable by the server, not HttpOnly. */
export function writeThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
