"use client";
import LexiconCard from "./LexiconCard";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../../actions/getAnimals";
import { CircleLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Search from "../general/Search";
import LexiconFilter from "./LexiconFilter";
import LexiconFilterList from "./LexiconFilterList";
import LexiconSort from "./LexiconSort";

export default function LexiconGrid({
  user,
  spottedList,
  animalImageList,
}: {
  user: User | null;
  spottedList: number[];
  animalImageList: string[];
}) {
  const searchParams = useSearchParams();

  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [sortOrder, setSortOrder] = useState("ascending");
  const [animals, setAnimals] = useState<any>([]);
  const { ref, inView } = useInView();
  const regex = /[äöüß ]/g;

  useEffect(() => {
    const sortBy = searchParams.get("sortBy") || null;
    const sortOrder = searchParams.get("sortOrder") || null;
    console.log("sortBy", sortBy);
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
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getAnimals(
          Object.fromEntries(searchParams.entries()),
          offset,
          pageSize
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
  }, [searchParams]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getAnimals(
          Object.fromEntries(searchParams.entries()),
          offset,
          pageSize
        );
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimals((prevAnimals: any) => [...prevAnimals, ...data]);
        console.log(data);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView) {
      loadMoreAnimals();
    }
  }, [inView, searchParams, spottedList]);

  return (
    <div className="flex flex-col ">
      <LexiconFilterList />
      <div className="flex-col sm:flex-row flex gap-2 sm:gap-0 justify-between items-center">
        <LexiconFilter />

        <div className="flex items-center gap-2 border-">
          <Search placeholder="Tier suchen" />
        </div>
        <LexiconSort />
      </div>

      <div className="items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-1 sm:gap-4 mt-2 sm:mt-10">
        {animals &&
          animals.map((animal: any, index: number) => (
            <LexiconCard
              key={animal.id}
              id={animal.id}
              common_name={animal.common_name}
              scientific_name={animal.scientific_name}
              population_estimate={animal.population_estimate}
              endangerment_status={animal.endangerment_status}
              size_from={animal.size_from}
              size_to={animal.size_to}
              sortBy={sortBy}
              imageUrl={animal.image_link}
              user={user}
              spottedList={spottedList}
              animalImageExists={animalImageList.includes(
                animal.common_name.replace(regex, "_") + ".jpg"
              )}
            />
          ))}
      </div>

      {loadingMoreAnimals && (
        <div className="mb-4" ref={ref}>
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
