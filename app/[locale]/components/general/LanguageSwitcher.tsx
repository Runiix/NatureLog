"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * Locale segmented control. Uses next-intl's router, which swaps the locale
 * prefix properly; the old version rewrote path segment 1 by hand, dropped the
 * query string, and only ever toggled between two languages.
 */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Settings");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    const query = searchParams.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { locale: next });
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("language")}
      aria-busy={isPending}
      className="inline-flex rounded-lg border border-border bg-surface-sunken p-1"
    >
      {routing.locales.map((option) => {
        const selected = option === locale;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            lang={option}
            onClick={() => !selected && switchTo(option)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              selected ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
            )}
          >
            {t(`languages.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
