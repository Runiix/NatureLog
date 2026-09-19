"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Reading and writing the lexicon's filters, which live in the URL so they
 * survive reloads and can be shared. Multi-value filters are comma-separated.
 */
export function useUrlFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const commit = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const list = (key: string) => searchParams.get(key)?.split(",").filter(Boolean) ?? [];
  const has = (key: string, value: string) => list(key).includes(value);
  const flag = (key: string) => searchParams.get(key) === "true";

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = list(key);
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    if (next.length > 0) params.set(key, next.join(","));
    else params.delete(key);
    commit(params);
  };

  const set = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    commit(params);
  };

  const clear = (keys: readonly string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));
    commit(params);
  };

  return { searchParams, isPending, list, has, flag, toggle, set, clear };
}
