"use client";

import { ChevronLeft, ChevronRight, Collections } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import type CollectionAnimal from "@/app/[locale]/utils/CollectionAnimalType";
import { cn } from "@/app/[locale]/utils/cn";
import { ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

const AUTO_ADVANCE_MS = 8000;

/**
 * The user's most recent sightings as a small carousel. Auto-advance pauses
 * on hover/focus and is off for reduced-motion users; the dots are labelled.
 */
export default function RecentUploads({
  data,
  collectionHref,
}: {
  data: CollectionAnimal[];
  collectionHref: string;
}) {
  const t = useTranslations("Home.recent");
  const format = useFormatter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = data.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    return (
      <EmptyState
        icon={<Collections />}
        title={t("empty")}
        action={
          <ButtonLink href={collectionHref} variant="secondary" size="sm">
            {t("toCollection")}
          </ButtonLink>
        }
        className="border-none"
      />
    );
  }

  const current = data[index];
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-sunken">
        {data.map((slide, i) => (
          <Image
            key={slide.id}
            src={slide.signedUrls.collectionModal}
            alt={i === index ? t("photoAlt", { name: slide.common_name }) : ""}
            aria-hidden={i !== index}
            fill
            unoptimized
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t("previous")}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t("next")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {data.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t("goTo", { number: i + 1 })}
                  aria-current={i === index}
                  className={cn(
                    "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <p aria-live="polite" className="truncate text-sm text-fg-muted">
        {current.first_spotted_at
          ? t("spottedOn", {
              name: current.common_name,
              date: format.dateTime(new Date(current.first_spotted_at), { dateStyle: "medium" }),
            })
          : current.common_name}
      </p>
    </div>
  );
}
