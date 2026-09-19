"use client";

import { useTranslations } from "next-intl";
import type AnimalListSummary from "@/app/[locale]/utils/AnimalListSummaryType";
import { Card } from "../ui/Card";
import { VisibilityBadge } from "./VisibilityBadge";

/** One list in the overview grid. A real button: focusable, keyboard-operable. */
export default function AnimalListCard({
  list,
  onClick,
}: {
  list: AnimalListSummary;
  onClick: () => void;
}) {
  const t = useTranslations("Lists");
  return (
    <Card
      as="button"
      type="button"
      interactive
      onClick={onClick}
      className="flex h-full w-full flex-col gap-3 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug">
          {list.title || t("untitled")}
        </h2>
        <VisibilityBadge isPublic={list.is_public} />
      </div>
      {list.description && (
        <p className="line-clamp-3 text-sm text-fg-muted">{list.description}</p>
      )}
    </Card>
  );
}
