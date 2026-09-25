"use client";

import { SearchOff } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../../actions/lexicon/getAnimals";
import type { Tables } from "@/utils/supabase/types";
import useSearchPending from "@/app/[locale]/utils/searchPending";
import { EmptyState } from "../ui/EmptyState";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { Spinner } from "../ui/Spinner";
import LexiconCard from "./LexiconCard";

type Animal = Pick<
  Tables<"animals">,
  | "id"
  | "common_name"
  | "scientific_name"
  | "endangerment_status"
  | "size_from"
  | "size_to"
  | "very_rare"
  | "lexicon_link"
>;
const PAGE_SIZE = 24;
const SNAPSHOT_MAX_AGE_MS = 30 * 60 * 1000;

type Snapshot = {
  animals: Animal[];
  offset: number;
  hasMore: boolean;
  scrollY: number;
  savedAt: number;
};

// The URL that the last back/forward navigation landed on. popstate fires
// before the App Router renders that page, so a grid mounting for that URL
// knows to restore its snapshot instead of starting at the first page.
// Not cleared on mount: the traversal renders in a transition that React may
// throw away and retry, and the grid can remount once fresh data streams in;
// every one of those mounts must still restore. A link click starts a normal
// navigation, so that is what clears it.
let traversedTo: URL | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    traversedTo = new URL(window.location.href);
  });
  document.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof Element && event.target.closest("a")) traversedTo = null;
    },
    true,
  );
}

function cameBackTo(filterKey: string) {
  return (
    traversedTo !== null &&
    traversedTo.pathname.endsWith("/lexiconpage") &&
    traversedTo.searchParams.toString() === filterKey
  );
}

const snapshotKey = (filterKey: string) => `lexicon-grid:${filterKey}`;

function readSnapshot(filterKey: string): Snapshot | null {
  try {
    const raw = sessionStorage.getItem(snapshotKey(filterKey));
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as Snapshot;
    return Date.now() - snapshot.savedAt < SNAPSHOT_MAX_AGE_MS ? snapshot : null;
  } catch {
    return null;
  }
}

function writeSnapshot(filterKey: string, snapshot: Snapshot) {
  try {
    sessionStorage.setItem(snapshotKey(filterKey), JSON.stringify(snapshot));
  } catch {
    // Storage full or blocked (private mode): going back just starts fresh.
  }
}

const toCardFields = ({
  id,
  common_name,
  scientific_name,
  endangerment_status,
  size_from,
  size_to,
  very_rare,
  lexicon_link,
}: Animal): Animal => ({
  id,
  common_name,
  scientific_name,
  endangerment_status,
  size_from,
  size_to,
  very_rare,
  lexicon_link,
});

/**
 * Infinite lexicon grid for the current URL filters. `spottedList` comes from
 * the server with the page — it used to be fetched in the browser after
 * render, and the filters were then re-run once it arrived.
 *
 * The first page is rendered on the server (`initialAnimals` for the filters
 * in `initialKey`), so crawlers see real links to every species on it. The
 * page remounts the grid per filter key; only a key the server did not render
 * is fetched here.
 *
 * Coming back to the lexicon via back/forward restores the loaded animals and
 * the scroll position from a sessionStorage snapshot, so infinite scroll picks
 * up where the user left off.
 */
export default function LexiconGrid({
  user,
  spottedList,
  initialAnimals,
  initialKey,
}: {
  user: User | null;
  spottedList: number[];
  initialAnimals: Animal[];
  initialKey: string;
}) {
  const t = useTranslations("Lexicon");
  const tGeneral = useTranslations("General");
  const searching = useSearchPending();
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();
  const sortBy = searchParams.get("sortBy");

  // Never true on the first page load, so hydration always uses the server props.
  const [restored] = useState(() => {
    const snapshot = cameBackTo(initialKey) ? readSnapshot(initialKey) : null;
    // TEMP debug for scroll restoration — remove once verified.
    if (typeof window !== "undefined") {
      console.log("[lexicon restore]", {
        traversedTo: traversedTo?.href ?? null,
        initialKey,
        restored: snapshot ? snapshot.animals.length : null,
        scrollY: snapshot?.scrollY,
      });
    }
    return snapshot;
  });

  const [animals, setAnimals] = useState<Animal[]>(restored?.animals ?? initialAnimals);
  const [offset, setOffset] = useState(restored?.offset ?? 1);
  const [hasMore, setHasMore] = useState(restored?.hasMore ?? initialAnimals.length === PAGE_SIZE);
  const generation = useRef(0);
  const loadingMore = useRef(false);
  const { ref: sentinel, inView } = useInView({ rootMargin: "600px" });

  useLayoutEffect(() => {
    if (restored) window.scrollTo(0, restored.scrollY);
  }, [restored]);

  // Tracked while scrolling: by the time the grid unmounts, the router may
  // already have scrolled the next page to the top.
  const scrollY = useRef(restored?.scrollY ?? 0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scrollY.current = window.scrollY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const latest = useRef({ animals, offset, hasMore });
  useEffect(() => {
    latest.current = { animals, offset, hasMore };
  }, [animals, offset, hasMore]);
  useEffect(() => {
    const save = () => {
      const { animals, offset, hasMore } = latest.current;
      writeSnapshot(initialKey, {
        animals: animals.map(toCardFields),
        offset,
        hasMore,
        scrollY: scrollY.current,
        savedAt: Date.now(),
      });
    };
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [initialKey]);

  useEffect(() => {
    if (filterKey === initialKey) return;
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
  }, [filterKey, initialKey]);

  useEffect(() => {
    if (!inView || !hasMore || offset === 0 || loadingMore.current) return;
    const current = generation.current;
    loadingMore.current = true;
    const params = Object.fromEntries(new URLSearchParams(filterKey).entries());
    getAnimals(params, offset, PAGE_SIZE)
      .then((data) => {
        if (current !== generation.current) return;
        setAnimals((prev) => [...prev, ...data]);
        setOffset((prev) => prev + 1);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((error) => console.error("Error loading more animals:", error))
      .finally(() => {
        loadingMore.current = false;
      });
  }, [inView, hasMore, offset, filterKey]);

  return (
    <LoadingOverlay loading={searching} label={tGeneral("searching")}>
      {animals.length === 0 ? (
        <EmptyState icon={<SearchOff />} title={t("emptyTitle")} description={t("emptyText")} />
      ) : (
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
      )}
    </LoadingOverlay>
  );
}
