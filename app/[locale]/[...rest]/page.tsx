import { notFound } from "next/navigation";

/**
 * Unknown paths under a locale match no route, so Next would render its
 * built-in 404 outside the app's layout. Catching them here routes them to
 * app/[locale]/not-found.tsx instead — localised and themed.
 */
export default function CatchAll() {
  notFound();
}
