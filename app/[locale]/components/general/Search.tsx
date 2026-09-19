"use client";

import { Close, Search as SearchIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * Search box bound to the `?query=` URL parameter (debounced), so results are
 * shareable and survive a reload. `placeholder` is a key in the General
 * messages.
 */
export default function Search({
  placeholder = "searchPlaceholder",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations("General");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const input = useRef<HTMLInputElement>(null);

  const apply = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term.trim()) params.set("query", term.trim());
    else params.delete("query");
    const query = params.toString();
    replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const handleSearch = useDebouncedCallback(apply, 250);
  const current = searchParams.get("query") ?? "";

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-subtle"
      >
        <SearchIcon fontSize="small" />
      </span>
      <input
        ref={input}
        type="search"
        defaultValue={current}
        placeholder={t(placeholder)}
        aria-label={t(placeholder)}
        onChange={(e) => handleSearch(e.target.value)}
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
