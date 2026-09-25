"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * On/off filter button bound to `?{param}=true`. The URL is the only state, so
 * back/forward and reloads stay in sync. Label shows from `sm` up; on phones
 * only the icon.
 */
export default function ToggleFilter({
  param,
  icon,
  label,
  hint,
  clears = [],
}: {
  param: string;
  icon: ReactNode;
  label: string;
  hint: string;
  /** Parameters removed when switching on, for filters that exclude each other. */
  clears?: string[];
}) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const active = searchParams.get(param) === "true";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (active) params.delete(param);
    else {
      params.set(param, "true");
      clears.forEach((key) => params.delete(key));
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, { scroll: false });
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      title={hint}
      aria-label={label}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg border text-sm sm:w-auto sm:px-3 font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-accent bg-accent/10 text-accent-text"
          : "border-border bg-surface text-fg-muted hover:text-fg",
        isPending && "opacity-60",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
