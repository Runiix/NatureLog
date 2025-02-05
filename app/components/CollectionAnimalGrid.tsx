"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import getCollectionAnimals from "../actions/getCollectionAnimals";
import { CircleLoader } from "react-spinners";
import CollectionCard from "./CollectionCard";

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
  spottedList: [number];
  animalCount: number;
  mammalCount: number;
  birdCount: number;
  reptileCount: number;
  amphibiaCount: number;
  insectCount: number;
  arachnoidCount: number;
  user: any;
  currUser?: "false";
  animalImageList: any;
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
  const regex = /[äöüß]/g;

  useEffect(() => {
    loadAnimals(0);
  }, [query, genus]);

  useEffect(() => {
    if (inView && loadingMoreAnimals) {
      loadMoreAnimals();
    }
  }, [inView]);

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

  const loadAnimals = async (offset: number) => {
    try {
      let pageSize = 0;
      if (window.innerWidth > 1500) {
        pageSize = 15;
      } else {
        pageSize = 12;
      }
      const data = await getCollectionAnimals(
        spottedList,
        offset,
        pageSize,
        query,
        genus
      );
      setLoading(false);

      if (data.length < pageSize) {
        setLoadingMoreAnimals(false);
      } else {
        setLoadingMoreAnimals(true);
      }
      setAnimalItems(data);
      setOffset(1);
    } catch (error) {
      console.error("Error loading animals:", error);
    }
  };

  const loadMoreAnimals = async () => {
    try {
      let pageSize = 0;
      if (window.innerWidth > 1500) {
        pageSize = 15;
      } else {
        pageSize = 12;
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
      setOffset((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more animals:", error);
    }
  };

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
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Vögel</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Vogel")}
            >
              <p className="text-green-600">{spottedBirdCount} </p>
              <p>/</p>
              <p>{birdCount}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Säugetiere</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Säugetier")}
            >
              <p className="text-green-600">{spottedMammalCount} </p>
              <p>/</p>
              <p>{mammalCount}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Amphibien</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Amphibie")}
            >
              <p className="text-green-600">{spottedAmphibiaCount} </p>
              <p>/</p>
              <p>{reptileCount}</p>{" "}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Reptilien</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Reptil")}
            >
              <p className="text-green-600">{spottedReptileCount} </p>
              <p>/</p>
              <p>{amphibiaCount}</p>{" "}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Insekten</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Insekt")}
            >
              <p className="text-green-600">{spottedInsectCount} </p>
              <p>/</p>
              <p>{insectCount}</p>{" "}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-900">Spinnen</p>
            <div
              className="bg-gray-900 w-20 text-center rounded-full p-2 mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1"
              onClick={() => setGenus("Arachnoid")}
            >
              <p className="text-green-600">{spottedArachnoidCount} </p>
              <p>/</p>
              <p>{arachnoidCount}</p>{" "}
            </div>
          </div>
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
      <div className="m-auto items-center justify-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-10">
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
              }/Collection/${
                animal.common_name.replace(regex, "_") + ".jpg"
              }?t=${new Date().getTime()}`}
              user={user}
              currUser={currUser}
              spottedList={spottedList}
              animalImageExists={animalImageList.some(
                (obj: any) =>
                  obj.name &&
                  obj.name === animal.common_name.replace(regex, "_") + ".jpg"
              )}
            />
          ))}
      </div>
      {loading && (
        <div className="m-10" ref={ref}>
          {" "}
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
      {loadingMoreAnimals && (
        <div className=" m-10" ref={ref}>
          {" "}
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
