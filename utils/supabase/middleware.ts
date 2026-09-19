import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // getUser() may have refreshed the session, and the new tokens only exist
  // as cookies on supabaseResponse. A bare redirect would drop them and log
  // the user out on the next request, so every redirect carries them over.
  const redirectWithSession = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  const pathname = request.nextUrl.pathname;
  const pathnameParts = pathname.split("/").filter(Boolean);
  const locale = pathnameParts[0] === "de" || pathnameParts[0] === "en" ? pathnameParts[0] : undefined;
  const normalizedPathname = locale
    ? `/${pathnameParts.slice(1).join("/")}`
    : pathname;
  const localePrefix = locale ? `/${locale}` : "";

  // Routes that require a session. /lexiconpage, /animalpage, /impressum,
  // /contactpage and /termsofservice are deliberately public.
  const protectedPaths = [
    "/homepage",
    "/collectionpage",
    "/profilepage",
    "/socialpage",
    "/settingspage",
    "/animallistspage",
  ];
  const authPages = ["/loginpage", "/passwordreset"];

  if (!user && protectedPaths.some((path) => normalizedPathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/loginpage`;
    return redirectWithSession(url);
  }

  if (
    user &&
    (
      normalizedPathname === "/" ||
      pathname === "/de" ||
      pathname === "/en" ||
      authPages.some((path) => normalizedPathname.startsWith(path))
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix || "/de"}/homepage`;
    return redirectWithSession(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  return supabaseResponse;
}
