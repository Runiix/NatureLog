"use client";

import { HideImage } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import ToggleFilter from "./ToggleFilter";

/** "Only species without a photo" toggle, bound to `?noImages=true`. */
export default function ImageExistsFilter() {
  const t = useTranslations("Collection");
  return (
    <ToggleFilter
      param="noImages"
      icon={<HideImage fontSize="small" aria-hidden />}
      label={t("withoutPhoto")}
      hint={t("withoutPhotoHint")}
    />
  );
}
