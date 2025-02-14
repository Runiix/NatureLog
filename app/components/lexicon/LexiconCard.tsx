"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import FavoriteButton from "../general/FavoriteButton";
import { User } from "@supabase/supabase-js";

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
  sortBy: string;
  imageUrl: string;
  user: User | null;
  spottedList: number[];
  animalImageExists: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const [src, setSrc] = useState(imageUrl);

  const handleError = () => {
    setSrc(
      "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
    );
  };

  return (
    <div className="group">
      <Link href={link}>
        <div className="flex flex-col w-80 bg-gray-900 rounded-lg">
          {animalImageExists ? (
            <div>
              <Image
                src={src}
                alt="Placeholder"
                width={300}
                height={200}
                priority
                className="object-cover w-full h-48 rounded-t-lg hover:opacity-90 "
                onError={handleError}
              />
            </div>
          ) : (
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full  rounded-t-lg hover:opacity-90 h-48"
              onError={handleError}
            />
          )}

          <div className=" p-4 w-full flex justify-between items-center">
            <div>
              <h2 className="text-2xl">{common_name}</h2>
              <h3 className="text-sm">
                {sortBy === "common_name"
                  ? scientific_name
                  : sortBy === "population_estimate"
                  ? population_estimate
                  : sortBy === "size_from"
                  ? `${size_from} - ${size_to} cm`
                  : endangerment_status}
              </h3>
            </div>
            <FavoriteButton user={user} id={id} spottedList={spottedList} />
          </div>
        </div>
      </Link>
    </div>
  );
}
