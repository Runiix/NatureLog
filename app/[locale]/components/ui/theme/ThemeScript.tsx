import { SYSTEM_THEME_SCRIPT } from "./theme";

/**
 * Server-rendered into <head> only for the "system" preference. It runs while
 * the HTML is still being parsed, so the dark class is in place before the
 * first paint. An explicit light/dark choice needs no script at all: the
 * server reads it from the cookie and renders the class directly.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />;
}
