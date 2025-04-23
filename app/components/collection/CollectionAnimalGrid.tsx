"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import getCollectionAnimals from "../../actions/getCollectionAnimals";
import { CircleLoader } from "react-spinners";
import CollectionCard from "./CollectionCard";
import { User } from "@supabase/supabase-js";
import Search from "../general/Search";
import GenusFilter from "./GenusFilter";
import ImageExistsFilter from "./ImageExistsFilter";
import Animal from "@/app/utils/AnimalType";

type SpottedAnimal = {
  animal_id: number;
  image: boolean;
  first_spotted_at: string;
};

export default function CollectionAnimalGrid({
  categoryCounts,
  counts,
  user,
  currUser,
}: {
  categoryCounts: { category: string }[];
  counts: number[];
  user: User;
  currUser?: "false";
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const { ref, inView } = useInView();
  const [genus, setGenus] = useState<string>("all");
  const [noImages, setNoImages] = useState("false");
  const [spottedList, setSpottedList] = useState<SpottedAnimal[]>([]);
  const [animalItems, setAnimalItems] = useState<Animal[]>([]);
  const regex = /[äöüß\s]/g;

  useEffect(() => {
    setGenus(searchParams.get("genus") || "all");
    setNoImages(searchParams.get("noImages") || "false");
  }, [searchParams]);

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
          user,
          offset,
          pageSize,
          query,
          Object.fromEntries(searchParams.entries())
        );
        if (data[0].length < pageSize) {
          setLoadingMoreAnimals(false);
        } else {
          setLoadingMoreAnimals(true);
        }

        setAnimalItems(data[0]);
        setSpottedList(data[1]);
        setOffset(1);
      } catch (error) {
        console.error("Error loading animals:", error);
      }
    };
    loadAnimals(0);
  }, [query, searchParams]);

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
          user,
          offset,
          pageSize,
          query,
          Object.fromEntries(searchParams.entries())
        );
        if (data[0].length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimalItems((prevAnimals: Animal[]) => [...prevAnimals, ...data[0]]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView) {
      loadMoreAnimals();
    }
  }, [inView, genus, query, noImages]);
  const searchFirstSpotted = (animalId: number) => {
    const animal = spottedList.find(
      (animal: { animal_id: number }) => animal.animal_id === animalId
    );
    return animal ? animal.first_spotted_at : null;
  };
  return (
    <div className="mt-4 sm:mt-10 flex items-center flex-col">
      <div className="flex sm:flex-col items-center justify-center gap-2 ">
        <GenusFilter counts={counts} categoryCounts={categoryCounts} />
        <div className="flex gap-4 items-center">
          <Search placeholder="Tier Suchen" />
          <ImageExistsFilter />
        </div>
      </div>
      <div className="mx-auto items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-1 sm:gap-4 mt-4 sm:mt-10">
        {animalItems &&
          animalItems.map((animal: Animal, index: number) => (
            <CollectionCard
              key={animal.id}
              id={animal.id}
              common_name={animal.common_name}
              imageUrl={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
                user.id
              }/Collection/${animal.common_name.replace(regex, "_") + ".jpg"}`}
              modalUrl={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
                user.id
              }/CollectionModals/${
                animal.common_name.replace(regex, "_") + ".jpg"
              }`}
              user={user}
              currUser={currUser}
              idList={spottedList.map(
                (animal: SpottedAnimal) => animal.animal_id
              )}
              first_spotted_at={searchFirstSpotted(animal.id) || ""}
              animalImageExists={spottedList.some(
                (obj: SpottedAnimal) =>
                  obj.animal_id === animal.id && obj.image === true
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
