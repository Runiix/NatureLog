"use client";

import addAnimalToAnimalList from "@/app/actions/animallists/addAnimalToAnimalList";
import { Add, CheckCircle } from "@mui/icons-material";
import Image from "next/image";
import React, { useState } from "react";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import removeAnimalFromAnimalList from "@/app/actions/animallists/removeAnimalFromAnimalList";
import { User } from "@supabase/supabase-js";

export default function AnimalListSearchItem({
  listId,
  animalId,
  name,
  image,
  user,
  spottedList,
  inList,
  refresh,
  entryCount,
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string;
  user: User;
  spottedList: number[];
  inList: boolean;
  refresh: React.Dispatch<React.SetStateAction<boolean>>;
  entryCount: number;
}) {
  const [isInList, setIsInList] = useState(inList);
  const handleAnimalAdd = async () => {
    const res = await addAnimalToAnimalList(listId, animalId, user.id);
    if (res) {
      refresh(!refresh);
      setIsInList(true);
    }
  };
  const handleAnimalDelete = async () => {
    const res = await removeAnimalFromAnimalList(listId, animalId, user.id);
    if (res) {
      refresh(!refresh);
      setIsInList(false);
    }
  };
  return (
    <div className="flex gap-4 items-center border-x border-gray-200 rounded-lg shadow-black shadow-md bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 hover:border-green-600 ">
      <Image
        src={image}
        alt={name}
        width="100"
        height="100"
        className="h-auto w-24 rounded-l-lg aspect-[3/2] object-cover"
      />
      <h2 className="truncate">{name}</h2>
      <div className="ml-auto flex gap-4 mr-4">
        <FavoriteFunctionality
          user={user}
          id={animalId}
          spottedList={spottedList}
        />
        {isInList ? (
          <button
            onClick={() => handleAnimalDelete()}
            className="text-green-600 hover:text-red-600"
            aria-label="Tier von Liste entfernen"
          >
            <CheckCircle />
          </button>
        ) : (
          <button
            onClick={() => handleAnimalAdd()}
            className="hover:text-green-600"
            aria-label="Tier zu Liste hinzufügen"
          >
            <Add />
          </button>
        )}
      </div>
    </div>
  );
}
