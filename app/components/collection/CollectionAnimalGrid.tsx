"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import getCollectionAnimals from "../../actions/getCollectionAnimals";
import { CircleLoader } from "react-spinners";
import CollectionCard from "./CollectionCard";
import { User } from "@supabase/supabase-js";

export default function CollectionAnimalGrid({
  animals,
  spottedList,
  animalCount,
  mammalCount,
  birdCount,
  reptileCount,
  amphibiaCount,
  insectCount,
  arachnoidCount,
  user,
  currUser,
  animalImageList,
}: {
  animals: any;
  spottedList: number[];
  animalCount: number;
  mammalCount: number;
  birdCount: number;
  reptileCount: number;
  amphibiaCount: number;
  insectCount: number;
  arachnoidCount: number;
  user: User;
  currUser?: "false";
  animalImageList: { animal_id: any; image: any }[];
}) {
  const spottedBirdCount = animals.filter(
    (item: { category: string }) => item.category === "Vogel"
  ).length;
  const spottedMammalCount = animals.filter(
    (item: { category: string }) => item.category === "Säugetier"
  ).length;
  const spottedAmphibiaCount = animals.filter(
    (item: { category: string }) => item.category === "Amphibie"
  ).length;
  const spottedReptileCount = animals.filter(
    (item: { category: string }) => item.category === "Reptil"
  ).length;
  const spottedInsectCount = animals.filter(
    (item: { category: string }) => item.category === "Insekt"
  ).length;
  const spottedArachnoidCount = animals.filter(
    (item: { category: string }) => item.category === "Arachnoid"
  ).length;
  const genusList = [
    {
      name: "Vögel",
      value: "Vogel",
      spottedCount: spottedBirdCount,
      count: birdCount,
    },
    {
      name: "Säugetiere",
      value: "Säugetier",
      spottedCount: spottedMammalCount,
      count: mammalCount,
    },
    {
      name: "Amphibien",
      value: "Amphibie",
      spottedCount: spottedAmphibiaCount,
      count: amphibiaCount,
    },
    {
      name: "Reptilien",
      value: "Reptil",
      spottedCount: spottedReptileCount,
      count: reptileCount,
    },
    {
      name: "Insekten",
      value: "Insekt",
      spottedCount: spottedInsectCount,
      count: insectCount,
    },
    {
      name: "Spinnen",
      value: "Arachnoid",
      spottedCount: spottedArachnoidCount,
      count: arachnoidCount,
    },
  ];
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();
  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView();
  const [genus, setGenus] = useState<string>("all");
  const [animalItems, setAnimalItems] = useState<any>([]);
  const regex = /[äöüß ]/g;

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathName}?${params.toString()}`);
    setQuery(term);
  };

  useEffect(() => {
    const loadAnimals = async (offset: number) => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getCollectionAnimals(
          spottedList,
          offset,
          pageSize,
          query,
          genus
        );

        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        } else {
          setLoadingMoreAnimals(true);
        }
        setAnimalItems(data);
        console.log(data);
        setOffset(1);
      } catch (error) {
        console.error("Error loading animals:", error);
      }
    };
    loadAnimals(0);
  }, [query, genus, spottedList]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getCollectionAnimals(
          spottedList,
          offset,
          pageSize,
          query,
          genus
        );
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimalItems((prevAnimals: any) => [...prevAnimals, ...data]);
        console.log(animalItems, data);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView) {
      loadMoreAnimals();
    }
  }, [inView, genus, query, spottedList]);

  return (
    <div className="mt-20 flex items-center flex-col">
      <div>
        <div className="flex flex-col items-center justify-center ">
          <p className="text-gray-900">Arten</p>
          <div
            className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
            onClick={() => setGenus("all")}
          >
            <p className="text-green-600">{animals.length} </p>
            <p>/</p>
            <p>{animalCount}</p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-3 items-center justify-center">
          {genusList.map((genus) => (
            <div
              className="flex flex-col items-center justify-center"
              key={genus.value}
            >
              <p className="text-gray-900">{genus.name}</p>
              <div
                className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
                onClick={() => setGenus(genus.value)}
              >
                <p className="text-green-600">{genus.spottedCount} </p>
                <p>/</p>
                <p>{genus.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 ">
        <input
          id="Search"
          value={query}
          className=" z-0 bg-gray-900 border border-slate-100 hover:bg-gray-800 hover:cursor-pointer p-3 px-5 rounded-md"
          type="text"
          placeholder="Tier Suchen"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
      </div>
      <div className="m-auto items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4 mt-10">
        {animalItems &&
          animalItems.map((animal: any, index: number) => (
            <CollectionCard
              key={animal.id}
              id={animal.id}
              common_name={animal.common_name}
              scientific_name={animal.scientific_name}
              population_estimate={animal.population_estimate}
              endangerment_status={animal.endangerment_status}
              size_from={animal.size_from}
              size_to={animal.size_to}
              sortBy="common_name"
              imageUrl={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
                user.id
              }/Collection/${animal.common_name.replace(regex, "_") + ".jpg"}`}
              user={user}
              currUser={currUser}
              spottedList={spottedList}
              animalImageExists={animalImageList.some(
                (obj) => obj.animal_id === animal.id && obj.image === true
              )}
            />
          ))}
      </div>

      {loadingMoreAnimals && (
        <div className=" m-10" ref={ref}>
          {" "}
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
