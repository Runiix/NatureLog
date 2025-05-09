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
import { CheckCircle, VisibilityOff } from "@mui/icons-material";
import Animal from "@/app/utils/AnimalType";
import Switch from "../general/Switch";

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
  const [onlyUnseen, setOnlyUnseen] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);

  const { ref, inView } = useInView();
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
        const pageSize = 20;

        const data = await getAnimals(
          Object.fromEntries(searchParams.entries()),
          offset,
          pageSize
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
    if (inView) {
      loadMoreAnimals();
    }
  }, [inView, searchParams, spottedList]);

  return (
    <div className="flex flex-col overflow-wrap">
      <LexiconFilterList />
      <div className="flex-col md:flex-row flex gap-2 md:gap-0 justify-between items-center">
        <div className="flex items-center gap-[1px]">
          <LexiconFilter />
          <div className="flex items-center  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 h-11 justify-center gap-2 rounded-lg p-2">
            <VisibilityOff />
            <Switch
              value={onlyUnseen}
              onChange={() => setOnlyUnseen((prev) => !prev)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border-">
          <Search placeholder="Tier suchen" />
        </div>
        <LexiconSort />
      </div>

      <div className="items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4 mt-2 sm:mt-10">
        {animals &&
          animals.map((animal: Animal, index: number) => (
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
              imageUrl={animal.lexicon_link}
              user={user}
              spottedList={spottedList}
              onlyUnseen={onlyUnseen}
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
