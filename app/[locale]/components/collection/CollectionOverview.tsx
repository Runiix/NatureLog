"use client";

import { CalendarMonth, Category } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/app/[locale]/utils/cn";
import GenusFilter from "./GenusFilter";
import YearFilter from "./YearFilter";

type View = "groups" | "years";

/**
 * Counter cards above the collection, switchable between progress per group
 * (`?genus=`) and new species per year (`?year=`). Switching drops the filter
 * of the view being hidden, so no invisible filter keeps narrowing the grid.
 */
export default function CollectionOverview({
  counts,
  categoryCounts,
  yearCounts,
}: {
  counts: Record<string, number>;
  categoryCounts: { category: string }[];
  yearCounts: { year: string; count: number }[];
}) {
  const t = useTranslations("Collection");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [view, setView] = useState<View>(searchParams.has("year") ? "years" : "groups");

  const switchTo = (next: View) => {
    if (next === view) return;
    setView(next);
    const hidden = next === "years" ? "genus" : "year";
    if (!searchParams.has(hidden)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(hidden);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, { scroll: false });
    });
  };

  const tabs = [
    { value: "groups" as const, label: t("viewGroups"), icon: <Category fontSize="small" aria-hidden /> },
    { value: "years" as const, label: t("viewYears"), icon: <CalendarMonth fontSize="small" aria-hidden /> },
  ];

  // Phones: icon-only, next to the filter select. From `sm` up: labelled, above the cards.
  const viewSwitch = (compact: boolean) => (
    <div
      role="radiogroup"
      aria-label={t("viewLabel")}
      className={cn(
        "shrink-0 rounded-lg border border-border bg-surface p-0.5",
        compact ? "flex h-10 sm:hidden" : "hidden self-start sm:inline-flex",
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === view;
        return (
          <button
            key={tab.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? tab.label : undefined}
            title={compact ? tab.label : undefined}
            onClick={() => switchTo(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              compact ? "w-9 justify-center" : "px-3 py-1.5",
              active ? "bg-accent/10 text-accent-text" : "text-fg-muted hover:text-fg",
            )}
          >
            {tab.icon}
            {!compact && tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {viewSwitch(false)}
      {view === "groups" ? (
        <GenusFilter
          counts={counts}
          categoryCounts={categoryCounts}
          mobileAside={viewSwitch(true)}
        />
      ) : (
        <YearFilter
          yearCounts={yearCounts}
          total={categoryCounts.length}
          mobileAside={viewSwitch(true)}
        />
      )}
    </div>
  );
}
