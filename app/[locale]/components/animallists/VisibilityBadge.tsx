"use client";

import { Lock, Public } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";

/** Public/private as icon + text, so the state is never conveyed by colour alone. */
export function VisibilityBadge({ isPublic, className }: { isPublic: boolean; className?: string }) {
  const t = useTranslations("Lists");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isPublic ? "bg-accent/10 text-accent-text" : "bg-surface-sunken text-fg-muted",
        className,
      )}
    >
      <span aria-hidden className="flex [&_svg]:h-3.5 [&_svg]:w-3.5">
        {isPublic ? <Public /> : <Lock />}
      </span>
      {isPublic ? t("public") : t("private")}
    </span>
  );
}
