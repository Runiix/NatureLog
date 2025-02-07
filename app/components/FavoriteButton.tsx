"use client";

import { ReactEventHandler, useEffect, useState } from "react";
import { addOrRemoveAnimals } from "../actions/addOrRemoveAnimal";
import { usePathname } from "next/navigation";
import { Add, Favorite } from "@mui/icons-material";

export default function FavoriteButton({
  user,
  id,
  spottedList,
  styles,
}: {
  user: any;
  id: number;
  spottedList: [number];
  styles?: string;
}) {
  const [isSpotted, setIsSpotted] = useState("false");
  const pathname = usePathname();
  useEffect(() => {
    const checkIfSpotted = () => {
      if (spottedList !== undefined) {
        const isSpotted = spottedList.some((item) => item === id);
        if (isSpotted) setIsSpotted("true");
      }
    };
    checkIfSpotted();
  }, []);
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
  }

  return (
    <div className={styles}>
      {user && (
        <form
          id="spottedForm"
          onSubmit={async (e: any) => {
            e.preventDefault();
            const response = await addOrRemoveAnimals(new FormData(e.target));
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
            onClick={handleClick}
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
  );
}
