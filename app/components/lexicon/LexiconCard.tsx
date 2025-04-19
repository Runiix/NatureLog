"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FavoriteButton from "../general/FavoriteButton";
import { User } from "@supabase/supabase-js";
import black from "@/app/assets/images/black.webp";
import { usePathname, useRouter } from "next/navigation";
import { addOrRemoveAnimals } from "@/app/actions/addOrRemoveAnimal";
import { Add, Close, Favorite } from "@mui/icons-material";
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
  animalImageExists,
}: {
  id: number;
  common_name: string;
  scientific_name: string;
  population_estimate: string;
  endangerment_status: string;
  size_from: string;
  size_to: string;
  sortBy: string | null;
  imageUrl: string;
  user: User | null;
  spottedList: number[];
  animalImageExists: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };
  const handleNavigation = () => {
    router.push(link);
  };
  return (
    <div>
      <div
        onClick={handleNavigation}
        className="flex flex-col w-44 sm:w-80 bg-gray-900 rounded-lg group shadow-md shadow-gray-800 cursor-pointer"
      >
        {animalImageExists ? (
          <div>
            <Image
              ref={imageRef}
              src={imageUrl}
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-32 sm:h-48 rounded-t-lg hover:opacity-90  transition-opacity duration-[2s] opacity-0"
              onLoad={handleImageLoad}
            />
          </div>
        ) : (
          <Image
            src={black}
            alt="Placeholder"
            width={3}
            height={2}
            priority
            className="object-cover w-full  rounded-t-lg hover:opacity-90 h-32 sm:h-48"
          />
        )}

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
