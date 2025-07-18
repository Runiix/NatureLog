"use client";

import removeAnimalFromAnimalList from "@/app/actions/animallists/removeAnimalFromAnimalList";
import { Delete } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import FavoriteFunctionality from "../general/FavoriteFunctionality";

export default function AnimalListItem({
  listId,
  animalId,
  name,
  image,
  user,
  spottedList,
  deleteRefresh,
  currUser,
  entryCount,
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string;
  user: User;
  spottedList: number[];
  deleteRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  currUser: boolean;
  entryCount: number;
}) {
  const handleAnimalDelete = async () => {
    const res = await removeAnimalFromAnimalList(listId, animalId, user.id);
    if (res) {
      deleteRefresh(!deleteRefresh);
    }
  };
  return (
    <div className="flex gap-4 items-center border-x border-gray-200 rounded-lg shadow-black shadow-md bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 hover:border-green-600">
      <div className="relative w-[120px] md:w-[200px] aspect-[3/2] rounded-l-lg overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover rounded-l-lg"
        />
      </div>
      <div className=" flex flex-col sm:flex-row w-full h-full">
        <Link
          href={`/animalpage/${name}`}
          className="hover:text-green-600 text-wrap md:w-auto truncate  relative top-1"
        >
          <h2>{name}</h2>
        </Link>
        <div className="ml-auto flex gap-2 md:gap-4">
          <div>
            <FavoriteFunctionality
              user={user}
              id={animalId}
              spottedList={spottedList}
            />
          </div>
          {currUser && (
            <button
              className="hover:text-red-600 mr-4"
              onClick={() => handleAnimalDelete()}
              aria-label="Tier von Liste löschen"
            >
              <Delete />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
