import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "@/utils/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const OVERRIDE_HEADERS = "x-middleware-override-headers";

/**
 * Runs next-intl, then the Supabase session refresh, and returns one response
 * carrying both.
 *
 * This used to return the intl response only for a 307 and otherwise throw it
 * away, so any request header or cookie next-intl set on a pass-through
 * response (the resolved locale, NEXT_LOCALE) never reached the app.
 */
export default async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // Locale redirects (307/308) win outright; the session is refreshed on the
  // follow-up request.
  if (intlResponse.headers.has("location")) return intlResponse;

  const authResponse = await updateSession(request);
  if (authResponse.headers.has("location")) return authResponse;

  mergeInto(authResponse, intlResponse);
  return authResponse;
}

function mergeInto(target: NextResponse, source: NextResponse) {
  // Both responses may forward request-header overrides to the app; the list
  // of overridden headers has to be the union or one side's are dropped.
  const overrides = new Set(
    [target.headers.get(OVERRIDE_HEADERS), source.headers.get(OVERRIDE_HEADERS)]
      .flatMap((value) => value?.split(",") ?? [])
      .map((name) => name.trim())
      .filter(Boolean),
  );

  source.headers.forEach((value, key) => {
    if (key === OVERRIDE_HEADERS || key === "set-cookie") return;
    if (!target.headers.has(key)) target.headers.set(key, value);
  });
  if (overrides.size > 0) {
    target.headers.set(OVERRIDE_HEADERS, [...overrides].join(","));
  }

  for (const cookie of source.cookies.getAll()) {
    if (!target.cookies.has(cookie.name)) target.cookies.set(cookie);
  }
}

export const config = {
  matcher: [
    // Static files in /public must bypass the locale redirect, or
    // /manifest.json becomes /de/manifest.json (a 404). Listed by extension
    // rather than "anything with a dot" so usernames like "anna.m" still run
    // through auth and i18n.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|webmanifest|txt|xml|mp4|webm|woff2?)$).*)",
  ],
};
