"use client";

import { Add, Favorite } from "@mui/icons-material";
import Placeholder from "../assets/images/Placeholder.jpg";
import Image from "next/image";
import Link from "next/link";
import { addOrRemoveAnimals } from "../actions/addOrRemoveAnimal";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LexiconCard({
  id,
  common_name,
  scientific_name,
  category,
  description,
  habitat,
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
  category: string;
  description: string;
  habitat: string;
  population_estimate: string;
  endangerment_status: string;
  size_from: string;
  size_to: string;
  sortBy: string;
  imageUrl: string;
  user: any;
  spottedList: [number];
  animalImageExists: boolean;
}) {
  const [isSpotted, setIsSpotted] = useState("false");
  const link = `/animalpage/${common_name}`;
  const pathname = usePathname();
  const [src, setSrc] = useState(imageUrl);

  useEffect(() => {
    const checkIfSpotted = () => {
      if (spottedList !== undefined) {
        const isSpotted = spottedList.some((item) => item === id);
        if (isSpotted) setIsSpotted("true");
      }
    };
    checkIfSpotted();
  }, []);

  const handleChildElementClick = (e: any) => {
    e.stopPropagation();
  };
  const handleError = () => {
    setSrc(
      "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
    );
  };

  return (
    <div className="group">
      <Link href={link}>
        <div className="flex flex-col hover:cursor-pointer w-80 h-72 bg-gray-900 rounded-lg">
          {animalImageExists ? (
            <Image
              src={src}
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-full rounded-t-lg group-hover:opacity-90"
              onError={handleError}
            />
          ) : (
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-full rounded-t-lg group-hover:opacity-90"
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
            {user && (
              <form
                id="spottedForm"
                onSubmit={async (e: any) => {
                  e.preventDefault();
                  const response = await addOrRemoveAnimals(
                    new FormData(e.target)
                  );
                  if (response.success) {
                    setIsSpotted(String(response.isSpotted));
                  } else {
                    console.error(response.error);
                  }
                }}
              >
                <input type="hidden" name="animalId" value={id} />
                <input type="hidden" name="isSpotted" value={isSpotted} />
                <input type="hidden" name="pathname" value={pathname} />

                <button
                  type="submit"
                  className="bg-transparent border-none text-slate-400 cursor-pointer hover:text-green-600 hover:scale-110 transition duration-300"
                  onClick={(e) => handleChildElementClick(e)}
                >
                  {isSpotted === "true" ? (
                    <Favorite className="text-green-600" />
                  ) : (
                    <Add className="text-slate-200" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
