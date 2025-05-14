"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import black from "@/app/assets/images/black.webp";
import { useRouter } from "next/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";

export default function LexiconCard({
  id,
  common_name,
  scientific_name,
  population_estimate,
  endangerment_status,
  size_from,
  size_to,
  sortBy,
  imageUrl,
  user,
  spottedList,
  onlyUnseen,
}: {
  id: number;
  common_name: string;
  scientific_name: string;
  population_estimate: string;
  endangerment_status: string;
  size_from: number;
  size_to: number;
  sortBy: string | null;
  imageUrl: string;
  user: User | null;
  spottedList: number[];
  onlyUnseen: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const router = useRouter();
  const [isSpotted, setIsSpotted] = useState("false");
  useEffect(() => {
    const checkIfSpotted = () => {
      if (spottedList !== undefined) {
        const isSpotted = spottedList.some((item) => item === id);
        if (isSpotted) setIsSpotted("true");
      }
    };
    checkIfSpotted();
  }, [id, spottedList]);
  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };
  const handleNavigation = () => {
    router.push(link);
  };

  return (
    <div className={onlyUnseen && isSpotted === "true" ? "hidden" : ""}>
      <div
        onClick={handleNavigation}
        className="flex flex-col w-40 sm:w-80  shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 rounded-lg cursor-pointer"
      >
        {/* {animalImageExists ? ( */}
        <div>
          <Image
            ref={imageRef}
            src={imageUrl}
            alt="Placeholder"
            width={300}
            height={200}
            className="object-cover w-full h-24 sm:h-48 rounded-t-lg hover:opacity-90  transition-opacity duration-[2s] opacity-0"
            onLoad={handleImageLoad}
          />
        </div>

        <div className=" p-4 w-full flex justify-between items-center">
          <div>
            <h2 className="text-xs sm:text-2xl">{common_name}</h2>
            <h3 className="text-[0.5rem] sm:text-sm">
              {sortBy === "population_estimate"
                ? population_estimate
                : sortBy === "size_to"
                ? `${size_from} - ${size_to} cm`
                : sortBy === "endangerment_status"
                ? endangerment_status
                : sortBy === ""
                ? scientific_name
                : scientific_name}
            </h3>
          </div>
          <div>
            {user && (
              <FavoriteFunctionality
                user={user}
                id={id}
                spottedList={spottedList}
                buttonStyles=""
                modalStyles=""
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
