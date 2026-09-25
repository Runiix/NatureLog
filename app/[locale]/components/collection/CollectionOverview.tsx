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

  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label={t("viewLabel")}
        className="inline-flex self-start rounded-lg border border-border bg-surface p-0.5"
      >
        {tabs.map((tab) => {
          const active = tab.value === view;
          return (
            <button
              key={tab.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => switchTo(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active ? "bg-accent/10 text-accent-text" : "text-fg-muted hover:text-fg",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      {view === "groups" ? (
        <GenusFilter counts={counts} categoryCounts={categoryCounts} />
      ) : (
        <YearFilter yearCounts={yearCounts} total={categoryCounts.length} />
      )}
    </div>
  );
}
