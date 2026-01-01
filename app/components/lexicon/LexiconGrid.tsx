"use client";
import LexiconCard from "./LexiconCard";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../../actions/lexicon/getAnimals";
import { CircleLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Search from "../general/Search";
import LexiconFilter from "./LexiconFilter";
import LexiconFilterList from "./LexiconFilterList";
import LexiconSort from "./LexiconSort";
import Animal from "@/app/utils/AnimalType";
import { createClient } from "@/utils/supabase/client";

export default function LexiconGrid({
  user,
  spottedList,
}: {
  user: User | null;
  spottedList: number[];
}) {
  const searchParams = useSearchParams();

  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [sortOrder, setSortOrder] = useState("ascending");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [clientSpottedList, setClientSpottedList] = useState<number[]>(
    spottedList ?? []
  );
  const { ref: preloadRef, inView: preloadInView } = useInView();
  const regex = /[äöüß\s]/g;

  useEffect(() => {
    const sortBy = searchParams.get("sortBy") || null;
    const sortOrder = searchParams.get("sortOrder") || null;
    if (sortBy) {
      setSortBy(sortBy);
    } else {
      setSortBy("");
    }
    if (sortOrder) {
      setSortOrder(sortOrder);
    }
    const loadAnimals = async (offset: number) => {
      try {
        const pageSize = 20;

        const data = await getAnimals(
          Object.fromEntries(searchParams.entries()),
          offset,
          pageSize,
          clientSpottedList
        );
        setLoading(false);

        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        } else {
          setLoadingMoreAnimals(true);
        }
        setAnimals(data);
        setOffset(1);
      } catch (error) {
        console.error("Error loading Animals:", error);
      }
    };
    loadAnimals(0);
  }, [searchParams, clientSpottedList]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        const pageSize = 20;

        const data = await getAnimals(
          Object.fromEntries(searchParams.entries()),
          offset,
          pageSize,
          clientSpottedList
        );
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimals((prevAnimals: Animal[]) => [...prevAnimals, ...data]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (preloadInView) {
      loadMoreAnimals();
    }
  }, [preloadInView, searchParams, clientSpottedList]);

  // Load spotted list on the client after initial render to avoid blocking TTFB
  useEffect(() => {
    const fetchSpotted = async () => {
      if (!user) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("spotted")
          .select("animal_id")
          .eq("user_id", user.id);
        if (error) {
          console.error("Error getting spotted list (client)", error);
          return;
        }
        const ids = (data ?? []).map(
          (row: { animal_id: number }) => row.animal_id
        );
        setClientSpottedList(ids);
      } catch (e) {
        console.error("Unexpected error loading spotted list:", e);
      }
    };
    fetchSpotted();
    // Only run when user changes
  }, [user]);

  return (
    <div className="flex flex-col items-center overflow-wrap">
      <LexiconFilterList />
      <div className="flex-col md:flex-row flex gap-2 lg:gap-28 2xl:gap-64 justify-between items-center">
        <div className="flex items-center gap-[1px]">
          <LexiconFilter user={user} />
        </div>

        <div className="flex items-center gap-2 border-">
          <Search placeholder="Tier suchen" />
        </div>
        <LexiconSort />
      </div>

      <div className="items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4 mt-2 sm:mt-10 max-w-[1400px]">
        {animals &&
          animals.map((animal: Animal, index: number) => {
            const isPreloadTrigger = index === animals.length - 10;
            return (
              <div
                ref={isPreloadTrigger ? preloadRef : undefined}
                key={animal.id}
              >
                <LexiconCard
                  id={animal.id}
                  common_name={animal.common_name}
                  scientific_name={animal.scientific_name}
                  population_estimate={animal.population_estimate}
                  endangerment_status={animal.endangerment_status}
                  size_from={animal.size_from}
                  size_to={animal.size_to}
                  sortBy={sortBy}
                  imageUrl={animal.lexicon_link}
                  very_rare={animal.very_rare}
                  user={user}
                  spottedList={clientSpottedList}
                />
              </div>
            );
          })}
      </div>

      {loadingMoreAnimals && (
        <div className="mb-4">
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
