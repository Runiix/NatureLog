"use client";

import { ArrowDownward, ExpandMore } from "@mui/icons-material";
import { cn } from "@/app/[locale]/utils/cn";
import { useUrlFilters } from "../lexicon/useUrlFilters";

/**
 * Sort column (native select — keyboard and screen-reader friendly) + direction,
 * bound to `?sortBy=` and `?sortOrder=descending`. The default column and the
 * ascending direction are left out of the URL.
 */
export default function SortControl({
  id,
  options,
  defaultColumn,
  labels,
  className,
  selectClassName,
}: {
  id: string;
  options: { value: string; label: string }[];
  defaultColumn: string;
  labels: { label: string; toggleOrder: string; ascending: string; descending: string };
  className?: string;
  /** Applied to the select's wrapper, e.g. to let it grow. */
  selectClassName?: string;
}) {
  const filters = useUrlFilters();
  const sortBy = filters.searchParams.get("sortBy") ?? defaultColumn;
  const descending = filters.searchParams.get("sortOrder") === "descending";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="sr-only" htmlFor={id}>
        {labels.label}
      </label>
      {/* Own chevron instead of the native arrow, matching the collection's filter select. */}
      <div className={cn("relative", selectClassName)}>
        <select
          id={id}
          value={sortBy}
          onChange={(e) =>
            filters.set({ sortBy: e.target.value === defaultColumn ? null : e.target.value })
          }
          className="h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-fg transition-colors hover:border-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ExpandMore
          fontSize="small"
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
      </div>
      <button
        type="button"
        onClick={() => filters.set({ sortOrder: descending ? null : "descending" })}
        aria-label={`${labels.toggleOrder}: ${descending ? labels.descending : labels.ascending}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowDownward
          fontSize="small"
          className={cn("transition-transform", !descending && "rotate-180")}
        />
      </button>
    </div>
  );
}
