"use client";

import { ErrorOutline, Home, Refresh } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, ButtonLink } from "./Button";

/**
 * Body for the route error boundaries. Logs the error (the digest links it to
 * the server log in production) and offers a retry that re-renders the
 * segment.
 */
export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorBoundary");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-24 font-normal text-fg">
      <div role="alert" className="flex max-w-md flex-col items-center gap-4 text-center">
        <div
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger [&_svg]:h-8 [&_svg]:w-8"
        >
          <ErrorOutline />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted">{t("text")}</p>
        {error.digest && (
          <p className="font-mono text-xs text-fg-subtle">Ref: {error.digest}</p>
        )}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} icon={<Refresh />}>
            {t("retry")}
          </Button>
          <ButtonLink href="/" variant="secondary" icon={<Home />}>
            {t("home")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
