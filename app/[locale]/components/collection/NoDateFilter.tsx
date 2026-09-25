"use client";

import { EventBusy } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import ToggleFilter from "./ToggleFilter";

/**
 * "Only species without a sighting date" toggle, bound to `?noDate=true`.
 * Switching it on drops `?year=`, which would match nothing alongside it.
 */
export default function NoDateFilter() {
  const t = useTranslations("Collection");
  return (
    <ToggleFilter
      param="noDate"
      icon={<EventBusy fontSize="small" aria-hidden />}
      label={t("withoutDate")}
      hint={t("withoutDateHint")}
      clears={["year"]}
    />
  );
}
