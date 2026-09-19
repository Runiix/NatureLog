"use client";

import { ArrowDownward } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";
import { SORT_COLUMNS } from "@/app/[locale]/utils/lexiconFilters";
import { useUrlFilters } from "./useUrlFilters";

/** Sort column (native select — keyboard and screen-reader friendly) + direction. */
export default function LexiconSort() {
  const t = useTranslations("Lexicon.sort");
  const filters = useUrlFilters();
  const sortBy = filters.searchParams.get("sortBy") ?? "common_name";
  const descending = filters.searchParams.get("sortOrder") === "descending";

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="lexicon-sort">
        {t("label")}
      </label>
      <select
        id="lexicon-sort"
        value={sortBy}
        onChange={(e) =>
          filters.set({ sortBy: e.target.value === "common_name" ? null : e.target.value })
        }
        className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-fg transition-colors hover:border-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {SORT_COLUMNS.map((column) => (
          <option key={column} value={column}>
            {t(column)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => filters.set({ sortOrder: descending ? null : "descending" })}
        aria-label={`${t("toggleOrder")}: ${descending ? t("descending") : t("ascending")}`}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowDownward
          fontSize="small"
          className={cn("transition-transform", !descending && "rotate-180")}
        />
      </button>
    </div>
  );
}
