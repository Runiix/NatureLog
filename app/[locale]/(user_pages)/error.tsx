"use client";

import { ErrorView } from "../components/ui/ErrorView";

/**
 * Error boundary for every signed-in page. Rendering inside the (user_pages)
 * layout keeps the nav on screen, so the user can navigate away as well as
 * retry.
 */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} />;
}
