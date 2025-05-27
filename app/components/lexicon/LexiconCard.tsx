"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import black from "@/app/assets/images/black.webp";
import { useRouter } from "next/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import { Star } from "@mui/icons-material";

export default function LexiconCard({
  id,
  common_name,
  scientific_name,
  population_estimate,
  endangerment_status,
  size_from,
  size_to,
  sortBy,
  very_rare,
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
  very_rare: boolean;
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
            className="object-cover w-full h-24 sm:h-48 rounded-t-lg hover:opacity-90  transition-opacity duration-[1s] opacity-0"
            onLoad={handleImageLoad}
          />
        </div>

        <div className=" p-4 w-full flex justify-between items-center">
          <div>
            <div className="flex gap-1 items-center">
              <h2 className="text-xs sm:text-2xl truncate max-w-56 hover:max-w-full">
                {common_name}
              </h2>
              {very_rare && (
                <div className="group relative">
                  {" "}
                  <Star className="text-red-600 scale-75" />{" "}
                  <div className="opacity-0 transition-all absolute duration-200 group-hover:opacity-100 shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70%  to-gray-900 border border-gray-200 rounded-lg p-2">
                    <p className="text-xs text-center">
                      Ausnahemeerscheinung oder Irrgast in Deutschland
                    </p>
                  </div>
                </div>
              )}
            </div>
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
