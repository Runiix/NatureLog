"use client";

import { ThumbUp } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";
import { countColor } from "./filterLists";
import type { MapMarker } from "./types";

/**
 * The lists currently inside the map view. Hovering a row highlights its pin;
 * clicking brings the pin into view and opens its popup.
 */
export default function ListsSidePanel({
  lists,
  highlightedId,
  onHover,
  onSelect,
  className,
}: {
  lists: MapMarker[];
  highlightedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("Map");
  const sorted = [...lists].sort((a, b) => b.upvotes - a.upvotes || b.entry_count - a.entry_count);

  return (
    <aside
      aria-label={t("inView", { count: lists.length })}
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border-muted bg-surface shadow-card",
        className,
      )}
    >
      <h2 className="border-b border-border-muted px-4 py-3 text-sm font-semibold text-fg">
        {t("inView", { count: lists.length })}
      </h2>
      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-sm text-fg-muted">{t("noneInView")}</p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-border-muted overflow-y-auto" onMouseLeave={() => onHover(null)}>
          {sorted.map((list) => (
            <li key={list.id}>
              <button
                type="button"
                onClick={() => onSelect(list.id)}
                onMouseEnter={() => onHover(list.id)}
                onFocus={() => onHover(list.id)}
                onBlur={() => onHover(null)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                  list.id === highlightedId ? "bg-accent/10" : "hover:bg-surface-sunken",
                )}
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: countColor(list.entry_count) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{list.title || t("untitled")}</span>
                  <span className="block truncate text-xs text-fg-muted">
                    {t("entries", { count: list.entry_count })} · {t("by", { name: list.username })}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-fg-muted">
                  <ThumbUp sx={{ fontSize: 12 }} aria-hidden />
                  {list.upvotes}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
