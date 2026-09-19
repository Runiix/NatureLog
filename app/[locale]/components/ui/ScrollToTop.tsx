"use client";

import { KeyboardArrowUp } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * Small floating button (bottom right) that smooth-scrolls back to the top.
 * Only shown once the page has been scrolled down a bit.
 */
export function ScrollToTop() {
  const t = useTranslations("General");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label={t("scrollToTop")}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 text-fg-muted shadow-md backdrop-blur transition-all duration-200 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <KeyboardArrowUp fontSize="small" />
    </button>
  );
}
