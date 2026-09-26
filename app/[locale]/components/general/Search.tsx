"use client";

import { Close, Search as SearchIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/app/[locale]/utils/cn";
import { setSearchPending } from "@/app/[locale]/utils/searchPending";
import { Spinner } from "../ui/Spinner";

/**
 * Search box bound to the `?query=` URL parameter (debounced), so results are
 * shareable and survive a reload. `placeholder` is a key in the General
 * messages. Pages whose results are expensive to load (image grids) pass a
 * longer `debounceMs`, so no search runs for a half-typed word.
 *
 * While the new query navigates in, the icon turns into a spinner and
 * `useSearchPending()` is true for the grid to show its loading state.
 */
export default function Search({
  placeholder = "searchPlaceholder",
  className,
  debounceMs = 250,
}: {
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}) {
  const t = useTranslations("General");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [typing, setTyping] = useState(false);
  const [navigating, startNavigation] = useTransition();

  useEffect(() => {
    setSearchPending(navigating);
  }, [navigating]);
  useEffect(() => () => setSearchPending(false), []);

  const apply = (term: string) => {
    setTyping(false);
    const params = new URLSearchParams(searchParams);
    if (term.trim()) params.set("query", term.trim());
    else params.delete("query");
    const query = params.toString();
    startNavigation(() => {
      replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };
  const handleSearch = useDebouncedCallback(apply, debounceMs);
  const current = searchParams.get("query") ?? "";

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-subtle"
      >
        {typing || navigating ? (
          <Spinner size="sm" className="m-0.5 text-accent" />
        ) : (
          <SearchIcon fontSize="small" />
        )}
      </span>
      {navigating && (
        <span role="status" className="sr-only">
          {t("searching")}
        </span>
      )}
      <input
        ref={input}
        type="search"
        defaultValue={current}
        placeholder={t(placeholder)}
        aria-label={t(placeholder)}
        onChange={(e) => {
          setTyping(true);
          handleSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          // Enter also confirms an IME candidate; only a finished term submits.
          if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSearch.flush();
        }}
        className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-sm text-fg placeholder:text-fg-subtle transition-colors hover:border-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {current && (
        <button
          type="button"
          onClick={() => {
            if (input.current) input.current.value = "";
            handleSearch.cancel();
            apply("");
          }}
          aria-label={t("clearSearch")}
          className="absolute right-2 top-1/2 flex -translate-y-1/2 rounded p-0.5 text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Close fontSize="small" />
        </button>
      )}
    </div>
  );
}
