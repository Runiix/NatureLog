"use client";

import { Pets, SearchOff } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import getCollectionAnimals from "../../actions/collection/getCollectionAnimals";
import type CollectionAnimal from "@/app/[locale]/utils/CollectionAnimalType";
import useSearchPending from "@/app/[locale]/utils/searchPending";
import { ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SkeletonCard } from "../ui/Skeleton";
import { Spinner } from "../ui/Spinner";
import CollectionCard from "./CollectionCard";

const PAGE_SIZE = 20;

/** No matches for the filters, or an empty collection (with a nudge for the owner). */
function EmptyCollection({ filtered, isOwner }: { filtered: boolean; isOwner: boolean }) {
  const t = useTranslations("Collection");
  if (filtered) {
    return (
      <EmptyState
        icon={<SearchOff />}
        title={t("emptyFilteredTitle")}
        description={t("emptyFilteredText")}
      />
    );
  }
  return (
    <EmptyState
      icon={<Pets />}
      title={isOwner ? t("emptyOwnerTitle") : t("emptyVisitorTitle")}
      description={isOwner ? t("emptyOwnerText") : undefined}
      action={
        isOwner ? (
          <ButtonLink href="/lexiconpage" variant="secondary">
            {t("toLexicon")}
          </ButtonLink>
        ) : undefined
      }
    />
  );
}

/**
 * Infinite grid of a user's collection, filtered by the URL (query, genus,
 * noImages, noDate, year). Same generation-counter loader as the lists: a filter change
 * restarts from page 0 and discards any in-flight "load more".
 */
export default function CollectionAnimalGrid({
  user,
  ownerId,
  isOwner,
  viewerSpotted,
}: {
  /** The signed-in viewer — favourites act on their collection. */
  user: User;
  /** Whose collection is being shown. */
  ownerId: string;
  isOwner: boolean;
  /** The viewer's spotted animal ids, for the favourite buttons. */
  viewerSpotted: number[];
}) {
  const t = useTranslations("Collection");
  const tGeneral = useTranslations("General");
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const filtered = ["query", "genus", "noImages", "noDate", "year"].some((key) =>
    searchParams.has(key),
  );

  const [animals, setAnimals] = useState<CollectionAnimal[] | null>(null);
  // The filters `animals` was loaded for; differs from `filterKey` while a
  // refetch for new filters is in flight.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const searching = useSearchPending() || (animals !== null && loadedKey !== filterKey);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const generation = useRef(0);
  const loadingMore = useRef(false);
  const { ref: sentinel, inView } = useInView({ rootMargin: "400px" });

  useEffect(() => {
    const current = ++generation.current;
    const params = Object.fromEntries(new URLSearchParams(filterKey).entries());
    getCollectionAnimals(ownerId, 0, PAGE_SIZE, params.query ?? "", params)
      .then((data) => {
        if (current !== generation.current) return;
        setAnimals(data);
        setLoadedKey(filterKey);
        setOffset(1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => {
        console.error("Error loading collection:", error);
        // Show the stale results rather than a spinner that never ends.
        if (current === generation.current) setLoadedKey(filterKey);
      });
  }, [filterKey, ownerId]);

  useEffect(() => {
    if (!inView || !hasMore || offset === 0 || loadingMore.current) return;
    const current = generation.current;
    loadingMore.current = true;
    const params = Object.fromEntries(new URLSearchParams(filterKey).entries());
    getCollectionAnimals(ownerId, offset, PAGE_SIZE, params.query ?? "", params)
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
  }, [inView, hasMore, offset, filterKey, ownerId]);

  if (animals === null) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} className="aspect-[4/3.6]" />
        ))}
      </div>
    );
  }

  return (
    <LoadingOverlay loading={searching} label={tGeneral("searching")}>
      {animals.length === 0 ? (
        <EmptyCollection filtered={filtered} isOwner={isOwner} />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {animals.map((animal) => (
              <li key={animal.id}>
                <CollectionCard
                  id={animal.id}
                  common_name={animal.common_name}
                  imageUrl={animal.signedUrls.collection}
                  modalUrl={animal.signedUrls.collectionModal}
                  user={user}
                  ownerId={ownerId}
                  isOwner={isOwner}
                  idList={viewerSpotted}
                  first_spotted_at={animal.first_spotted_at}
                  animalImageExists={animal.image ?? false}
                />
              </li>
            ))}
          </ul>
          {hasMore && !searching && (
            <div ref={sentinel} className="flex justify-center py-8 text-accent" aria-live="polite">
              <Spinner label={t("loadingMore")} />
            </div>
          )}
        </>
      )}
    </LoadingOverlay>
  );
}
