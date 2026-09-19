"use client";

import { ExpandMore } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import filterSpottedAnimals from "@/app/[locale]/utils/filterSpottedAnimals";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * Group filter with progress per group ("spotted / total"), bound to
 * `?genus=`. On phones a native select plus one progress bar for the chosen
 * group (the chip row with counts does not fit); from `sm` up, a wrapping row
 * of chips with per-group progress.
 */
export default function GenusFilter({
  counts,
  categoryCounts,
}: {
  counts: number[];
  categoryCounts: { category: string }[];
}) {
  const t = useTranslations("Collection");
  const tLex = useTranslations("Lexicon");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selected = searchParams.get("genus") ?? "all";

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("genus");
    else params.set("genus", value);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, {
        scroll: false,
      });
    });
  };

  const options = [
    {
      value: "all",
      label: t("all"),
      spotted: categoryCounts.length,
      total: counts[6] ?? 0,
    },
    ...filterSpottedAnimals(categoryCounts, counts).map((genus) => ({
      value: genus.value,
      label: tLex(genus.value),
      spotted: genus.spottedCount,
      total: genus.count,
    })),
  ];

  const current =
    options.find((option) => option.value === selected) ?? options[0];
  const currentRatio = current.total > 0 ? current.spotted / current.total : 0;

  return (
    <>
      <div className="flex flex-col gap-2 sm:hidden" aria-busy={isPending}>
        <div className="relative">
          <select
            value={current.value}
            onChange={(event) => select(event.target.value)}
            aria-label={t("filterLabel")}
            className={cn(
              "h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm font-medium text-fg transition-colors",
              "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
              isPending && "opacity-60",
            )}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.spotted}/{option.total})
              </option>
            ))}
          </select>
          <ExpandMore
            fontSize="small"
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
          >
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.round(currentRatio * 100)}%` }}
            />
          </span>
          <span className="shrink-0 text-xs tabular-nums text-fg-muted">
            {t("progress", { spotted: current.spotted, total: current.total })}
          </span>
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label={t("filterLabel")}
        aria-busy={isPending}
        className="hidden flex-wrap gap-2 sm:flex"
      >
        {options.map((option) => {
          const active = option.value === selected;
          const ratio = option.total > 0 ? option.spotted / option.total : 0;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(option.value)}
              className={cn(
                "relative flex shrink-0 flex-col items-start gap-1 overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "border-accent bg-accent/10"
                  : "border-border-muted bg-surface hover:border-accent",
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-accent-text" : "text-fg",
                )}
              >
                {option.label}
              </span>
              <span className="text-xs tabular-nums text-fg-muted">
                {t("progress", {
                  spotted: option.spotted,
                  total: option.total,
                })}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-surface-sunken"
              >
                <span
                  className="block h-full bg-accent"
                  style={{ width: `${Math.round(ratio * 100)}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
