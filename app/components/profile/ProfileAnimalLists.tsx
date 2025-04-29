import { Delete, Edit, Public, PublicOff, ThumbUp } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function ProfileAnimalLists({
  data,
  username,
}: {
  data: {
    id: string;
    title: string;
    description: string;
    upvotes: number;
    entry_count: number;
  }[];
  username: string;
}) {
  return (
    <div>
      <h2 className="text-xl mt-20 w-full">
        Öffentliche Listen von {username}:
      </h2>

      <div className="flex flex-col gap-4 md:space-between border-t-2 border-gray-200 pt-4">
        {data.map(
          (list: {
            id: string;
            title: string;
            description: string;
            upvotes: number;
            entry_count: number;
          }) => (
            <Link
              href={`/animallistspage/${username}/?listId=${list.id}`}
              key={list.id}
              className="p-4 md:min-w-[600px] flex-col gap-4 w-full mx-auto rounded-lg shadow-black shadow-lg flex justify-center bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200"
            >
              <div className="flex">
                {" "}
                <div className="w-full">
                  <div className=" border-b border-gray-200 flex">
                    {" "}
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl pb-2">{list.title}</h2>
                      <h2 className="text-2xl pb-2 flex items-center gap-1">
                        <ThumbUp />
                        {list.upvotes}
                      </h2>
                    </div>
                    <div className="ml-auto flex items-center mr-2  gap-2">
                      <h2 className="text-2xl pb-2">
                        {list.entry_count} Einträge
                      </h2>
                    </div>
                  </div>

                  <p className="text-gray-300"> {list.description}</p>
                </div>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
