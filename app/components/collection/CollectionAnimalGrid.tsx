"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import getCollectionAnimals from "../../actions/collection/getCollectionAnimals";
import { CircleLoader } from "react-spinners";
import CollectionCard from "./CollectionCard";
import { User } from "@supabase/supabase-js";
import Search from "../general/Search";
import GenusFilter from "./GenusFilter";
import ImageExistsFilter from "./ImageExistsFilter";

type SpottedAnimal = {
  animal_id: number;
  image: boolean;
  first_spotted_at: string;
};
type Animal = {
  signedUrls: {
    collection: string;
    collectionModal: string;
  };
  id: number;
  common_name: string;
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
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(true);
  const { ref: preloadRef, inView: preloadInView } = useInView();

  const [genus, setGenus] = useState<string>("all");
  const [noImages, setNoImages] = useState("false");
  const [animalItems, setAnimalItems] = useState<Animal[]>([]);
  const regex = /[äöüß\s]/g;

  useEffect(() => {
    setGenus(searchParams.get("genus") || "all");
    setNoImages(searchParams.get("noImages") || "false");
  }, [searchParams]);

  useEffect(() => {
    const loadAnimals = async (offset: number) => {
      try {
        const pageSize = 20;

        const data = await getCollectionAnimals(
          user,
          offset,
          pageSize,
          query,
          Object.fromEntries(searchParams.entries())
        );
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
    loadAnimals(0);
  }, [query, searchParams]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        const pageSize = 20;

        const data = await getCollectionAnimals(
          user,
          offset,
          pageSize,
          query,
          Object.fromEntries(searchParams.entries())
        );
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimalItems((prevAnimals: Animal[]) => [...prevAnimals, ...data]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (preloadInView) {
      loadMoreAnimals();
    }
  }, [preloadInView]);
  const searchFirstSpotted = (animalId: number) => {
    const animal = animalItems.find(
      (animal: { id: number }) => animal.id === animalId
    );
    return animal ? animal.first_spotted_at : null;
  };
  return (
    <div className="mt-4 sm:mt-10 flex items-center flex-col">
      <div className="flex flex-col items-center justify-center gap-2 ">
        <GenusFilter counts={counts} categoryCounts={categoryCounts} />
        <div className="flex gap-4 items-center">
          <Search placeholder="Tier Suchen" />
          <ImageExistsFilter />
        </div>
      </div>
      <div className="mx-auto items-center justify-center grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2  sm:gap-4 mt-4 sm:mt-10">
        {animalItems &&
          animalItems.map((animal: Animal, index: number) => {
            const isPreloadTrigger = index === animalItems.length - 10;
            return (
              <div
                ref={isPreloadTrigger ? preloadRef : undefined}
                key={animal.id}
              >
                <CollectionCard
                  id={animal.id}
                  common_name={animal.common_name}
                  imageUrl={animal.signedUrls.collection}
                  modalUrl={animal.signedUrls.collectionModal}
                  user={user}
                  currUser={currUser}
                  idList={animalItems.map((a) => a.id)}
                  first_spotted_at={searchFirstSpotted(animal.id) || ""}
                  animalImageExists={animal.image}
                />
              </div>
            );
          })}
      </div>

      {loadingMoreAnimals && (
        <div className=" m-10">
          {" "}
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
