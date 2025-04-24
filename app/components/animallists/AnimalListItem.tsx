"use client";

import removeAnimalFromAnimalList from "@/app/actions/removeAnimalFromAnimalList";
import { Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function AnimalListItem({
  listId,
  animalId,
  name,
  image,
  user,
  deleteRefresh,
  currUser,
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string;
  user: User;
  deleteRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  currUser: boolean;
}) {
  const handleAnimalDelete = async () => {
    const res = await removeAnimalFromAnimalList(listId, animalId, user.id);
    if (res) {
      deleteRefresh(!deleteRefresh);
    }
  };
  return (
    <div
      className={`flex gap-4 items-center px-4 py-2 h-16 border-y border-gray-200`}
    >
      <Image
        src={image}
        alt={name}
        width="100"
        height="100"
        className="object-cover aspect-video"
      />
      <Link href={`/animalpage/${name}`} className="hover:text-green-600">
        <h2>{name}</h2>
      </Link>

      {currUser && (
        <button
          className="hover:text-red-600 ml-auto"
          onClick={() => handleAnimalDelete()}
        >
          <Delete />
        </button>
      )}
    </div>
  );
}
