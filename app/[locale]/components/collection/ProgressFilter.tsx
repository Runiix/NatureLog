"use client";

import { ExpandMore } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/app/[locale]/utils/cn";

export type ProgressOption = {
  value: string;
  label: string;
  /** Second line under the label, e.g. "12 of 40". */
  detail: string;
  /** Fill of the progress bar, 0–1. */
  ratio: number;
};

/**
 * Filter cards bound to one URL parameter, each with a progress bar. The
 * option with value "all" removes the parameter. On phones a native select
 * plus one progress bar for the chosen option (the card row does not fit);
 * from `sm` up, a wrapping row of cards.
 */
export default function ProgressFilter({
  param,
  label,
  options,
  clears = [],
  mobileAside,
}: {
  param: string;
  /** Accessible name of the group. */
  label: string;
  options: ProgressOption[];
  /** Parameters removed when an option is picked, for filters that exclude each other. */
  clears?: string[];
  /** Rendered next to the select on phones. */
  mobileAside?: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selected = searchParams.get(param) ?? "all";

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(param);
    else params.set(param, value);
    if (value !== "all") clears.forEach((key) => params.delete(key));
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, {
        scroll: false,
      });
    });
  };

  const current =
    options.find((option) => option.value === selected) ?? options[0];

  return (
    <>
      <div className="flex flex-col gap-2 sm:hidden" aria-busy={isPending}>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <select
              value={current.value}
              onChange={(event) => select(event.target.value)}
              aria-label={label}
              className={cn(
                "h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm font-medium text-fg transition-colors",
                "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
                isPending && "opacity-60",
              )}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.detail})
                </option>
              ))}
            </select>
            <ExpandMore
              fontSize="small"
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
          </div>
          {mobileAside}
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
          >
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.round(current.ratio * 100)}%` }}
            />
          </span>
          <span className="shrink-0 text-xs tabular-nums text-fg-muted">
            {current.detail}
          </span>
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        aria-busy={isPending}
        className="hidden flex-wrap gap-2 sm:flex"
      >
        {options.map((option) => {
          const active = option.value === current.value;
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
                {option.detail}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-surface-sunken"
              >
                <span
                  className="block h-full bg-accent"
                  style={{ width: `${Math.round(option.ratio * 100)}%` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
