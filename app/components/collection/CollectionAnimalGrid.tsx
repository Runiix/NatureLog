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

export default function CollectionAnimalGrid({
  animals,
  spottedList,
  counts,
  user,
  currUser,
  animalImageList,
}: {
  animals: any;
  spottedList: number[];
  counts: number[];
  user: User;
  currUser?: "false";
  animalImageList: { animal_id: any; image: any; first_spotted_at: any }[];
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const { ref, inView } = useInView();
  const [genus, setGenus] = useState<string>("all");
  const [animalItems, setAnimalItems] = useState<any>([]);
  const regex = /[äöüß\s]/g;

  useEffect(() => {
    setGenus(searchParams.get("genus") || "all");
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
  }, [query, searchParams, genus, spottedList]);

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
  const searchFirstSpotted = (animalId: number) => {
    const animal = animalImageList.find(
      (animal) => animal.animal_id === animalId
    );
    return animal ? animal.first_spotted_at : null;
  };
  return (
    <div className="mt-4 sm:mt-10 flex items-center flex-col">
      <div className="flex sm:flex-col items-center justify-center gap-2 ">
        <GenusFilter counts={counts} animals={animals} />
        <Search placeholder="Tier Suchen" />
      </div>
      <div className="mx-auto items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-1 sm:gap-4 mt-4 sm:mt-10">
        {animalItems &&
          animalItems.map((animal: any, index: number) => (
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
              spottedList={spottedList}
              first_spotted_at={searchFirstSpotted(animal.id)}
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
