import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "@/utils/supabase/middleware";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Run next-intl middleware first
  const intlResponse = intlMiddleware(request);
  // If next-intl returns a redirect (to add locale), return it immediately
  if (intlResponse && intlResponse.status === 307) {
    return intlResponse;
  }
  // Otherwise, run Supabase session logic
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};