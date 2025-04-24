"use client";

import addAnimalToAnimalList from "@/app/actions/addAnimalToAnimalList";
import { Add, CheckCircle } from "@mui/icons-material";
import Image from "next/image";
import React, { useState } from "react";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import removeAnimalFromAnimalList from "@/app/actions/removeAnimalFromAnimalList";
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
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string;
  user: User;
  spottedList: number[];
  inList: boolean;
  refresh: React.Dispatch<React.SetStateAction<boolean>>;
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
    <div className="flex gap-4 items-center">
      <Image
        src={image}
        alt={name}
        width="100"
        height="100"
        className="h-auto w-24 "
      />
      <h2>{name}</h2>
      <div className="ml-auto flex gap-4 mr-4">
        {isInList ? (
          <button
            onClick={() => handleAnimalDelete()}
            className="text-green-600"
          >
            <CheckCircle />
          </button>
        ) : (
          <button onClick={() => handleAnimalAdd()}>
            <Add />
          </button>
        )}

        <FavoriteFunctionality
          user={user}
          id={animalId}
          spottedList={spottedList}
        />
      </div>
    </div>
  );
}
