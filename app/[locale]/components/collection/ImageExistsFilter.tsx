"use client";

import { HideImage } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/app/[locale]/utils/cn";

/**
 * "Only species without a photo" toggle, bound to `?noImages=true`. The URL
 * is the only state, so back/forward and reloads stay in sync.
 */
export default function ImageExistsFilter() {
  const t = useTranslations("Collection");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const active = searchParams.get("noImages") === "true";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (active) params.delete("noImages");
    else params.set("noImages", "true");
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
      title={t("withoutPhotoHint")}
      aria-label={t("withoutPhoto")}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg border text-sm sm:w-auto sm:px-3 font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-accent bg-accent/10 text-accent-text"
          : "border-border bg-surface text-fg-muted hover:text-fg",
        isPending && "opacity-60",
      )}
    >
      <HideImage fontSize="small" aria-hidden />
      <span className="hidden sm:inline">{t("withoutPhoto")}</span>
    </button>
  );
}
