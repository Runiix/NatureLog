"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/app/[locale]/utils/cn";
import Search from "../general/Search";

const TABS = [
  { value: "top", param: null, label: "topUsers" },
  { value: "following", param: "following", label: "following" },
  { value: "followers", param: "followers", label: "followers" },
] as const;

/** Top / following / followers tabs plus name search, all in the URL. */
export default function SocialFilter() {
  const t = useTranslations("Social");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get("following") ?? "top";

  const select = (param: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (param) params.set("following", param);
    else params.delete("following");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathName}?${query}` : pathName, { scroll: false });
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="radiogroup"
        aria-label={t("tabsLabel")}
        aria-busy={isPending}
        className="inline-flex self-start rounded-lg border border-border bg-surface-sunken p-1"
      >
        {TABS.map((tab) => {
          const selected = current === tab.value || (tab.value === "top" && current === "top");
          return (
            <button
              key={tab.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => select(tab.param)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                selected ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
              )}
            >
              {t(tab.label)}
            </button>
          );
        })}
      </div>
      <Search placeholder="searchNatureLoggers" className="sm:w-72" />
    </div>
  );
}
