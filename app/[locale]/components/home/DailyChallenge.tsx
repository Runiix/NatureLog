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
  "snail",
] as const;

type Target = (typeof TARGETS)[number];

const INVERTEBRATE_TARGETS: readonly Target[] = ["insect", "spider", "snail"];

/** The target for a day (`YYYY-MM-DD`); the same for everyone with the same setting. */
export function targetForDay(day: string, hideInvertebrates: boolean): Target {
  const targets = hideInvertebrates
    ? TARGETS.filter((target) => !INVERTEBRATE_TARGETS.includes(target))
    : TARGETS;
  return targets[seededIndex(`challenge:${day}`, targets.length)];
}

export default function DailyChallenge({ hideInvertebrates }: { hideInvertebrates: boolean }) {
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
        <p className="text-fg-muted">{t("text", {
            target: t(`targets.${targetForDay(new Date().toISOString().slice(0, 10), hideInvertebrates)}`),
          })}</p>
      ) : (
        <Skeleton className="h-5 w-3/4" />
      )}
    </div>
  );
}
