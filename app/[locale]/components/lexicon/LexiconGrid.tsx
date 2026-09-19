"use client";

import { SearchOff } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../../actions/lexicon/getAnimals";
import type { Tables } from "@/utils/supabase/types";
import { EmptyState } from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { Spinner } from "../ui/Spinner";
import LexiconCard from "./LexiconCard";

type Animal = Tables<"animals">;
const PAGE_SIZE = 24;

/**
 * Infinite lexicon grid for the current URL filters. `spottedList` comes from
 * the server with the page — it used to be fetched in the browser after
 * render, and the filters were then re-run once it arrived.
 */
export default function LexiconGrid({
  user,
  spottedList,
}: {
  user: User | null;
  spottedList: number[];
}) {
  const t = useTranslations("Lexicon");
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const sortBy = searchParams.get("sortBy");

  const [animals, setAnimals] = useState<Animal[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const generation = useRef(0);
  const loadingMore = useRef(false);
  const { ref: sentinel, inView } = useInView({ rootMargin: "600px" });

  useEffect(() => {
    const current = ++generation.current;
    const params = Object.fromEntries(new URLSearchParams(filterKey).entries());
    getAnimals(params, 0, PAGE_SIZE)
      .then((data) => {
        if (current !== generation.current) return;
        setAnimals(data);
        setOffset(1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => console.error("Error loading animals:", error));
  }, [filterKey]);

  useEffect(() => {
    if (!inView || !hasMore || offset === 0 || loadingMore.current) return;
    const current = generation.current;
    loadingMore.current = true;
    const params = Object.fromEntries(new URLSearchParams(filterKey).entries());
    getAnimals(params, offset, PAGE_SIZE)
      .then((data) => {
        if (current !== generation.current) return;
        setAnimals((prev) => [...(prev ?? []), ...data]);
        setOffset((prev) => prev + 1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => console.error("Error loading more animals:", error))
      .finally(() => {
        loadingMore.current = false;
      });
  }, [inView, hasMore, offset, filterKey]);

  if (animals === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <SkeletonCard key={i} className="aspect-[4/3.5]" />
        ))}
      </div>
    );
  }

  if (animals.length === 0) {
    return <EmptyState icon={<SearchOff />} title={t("emptyTitle")} description={t("emptyText")} />;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
        {animals.map((animal) => (
          <li key={animal.id}>
            <LexiconCard
              id={animal.id}
              common_name={animal.common_name}
              scientific_name={animal.scientific_name}
              endangerment_status={animal.endangerment_status}
              size_from={animal.size_from}
              size_to={animal.size_to}
              sortBy={sortBy}
              very_rare={animal.very_rare}
              imageUrl={animal.lexicon_link}
              user={user}
              spottedList={spottedList}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinel} className="flex justify-center py-8 text-accent" aria-live="polite">
          <Spinner label={t("loadingMore")} />
        </div>
      )}
    </>
  );
}
