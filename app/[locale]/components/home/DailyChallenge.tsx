"use client";

import { PhotoCamera } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { targetForDay } from "@/app/[locale]/utils/dailyChallenge";

export default function DailyChallenge({
  day,
  hideInvertebrates,
}: {
  /** `YYYY-MM-DD`, picked on the server so the client renders the same target. */
  day: string;
  hideInvertebrates: boolean;
}) {
  const t = useTranslations("Home.challenge");

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-text"
      >
        <PhotoCamera />
      </span>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-fg-muted">
        {t("text", { target: t(`targets.${targetForDay(day, hideInvertebrates)}`) })}
      </p>
    </div>
  );
}
