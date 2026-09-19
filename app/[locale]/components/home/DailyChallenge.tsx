"use client";

import { PhotoCamera } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import useHydrated from "@/app/[locale]/utils/useHydrated";
import { seededIndex } from "@/app/[locale]/utils/seededIndex";
import { Skeleton } from "../ui/Skeleton";

const TARGETS = [
  "songbird",
  "raptor",
  "waterbird",
  "mammal",
  "reptile",
  "amphibian",
  "insect",
  "spider",
] as const;

function targetForToday() {
  const today = new Date().toISOString().slice(0, 10);
  return TARGETS[seededIndex(`challenge:${today}`, TARGETS.length)];
}

export default function DailyChallenge() {
  const t = useTranslations("Home.challenge");
  // Picked in the browser so the server's clock cannot disagree with the
  // viewer's and produce a hydration mismatch.
  const hydrated = useHydrated();

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-text"
      >
        <PhotoCamera />
      </span>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      {hydrated ? (
        <p className="text-fg-muted">{t("text", { target: t(`targets.${targetForToday()}`) })}</p>
      ) : (
        <Skeleton className="h-5 w-3/4" />
      )}
    </div>
  );
}
