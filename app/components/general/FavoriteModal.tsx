import { addOrRemoveAnimals } from "@/app/actions/addOrRemoveAnimal";
import { Close } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import React from "react";

export default function FavoriteModal({
  user,
  id,
  styles,
  favoriteModal,
  changeFavoriteModal,
  isSpotted,
  setIsSpotted,
  pathName,
}: {
  user: User;
  id: number;
  styles?: string;
  favoriteModal: boolean;
  changeFavoriteModal: React.Dispatch<React.SetStateAction<boolean>>;
  isSpotted: string;
  setIsSpotted: React.Dispatch<React.SetStateAction<string>>;
  pathName: string;
}) {
  function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    changeFavoriteModal(false);
  }

  return (
    <div>
      {" "}
      {favoriteModal && (
        <div
          className={`${styles}fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
        >
          <div className="bg-gray-900 rounded-lg w-10/12 py-10 flex flex-col items-center justify-center gap-4 relative">
            <button
              onClick={handleButtonClick}
              className="absolute top-2 right-2 hover:text-slate-400"
            >
              <Close />
            </button>
            <h2 className="sm:text-xl text-center text-slate-200">
              Möchten sie diese Tier wirklich aus ihrer Sammlung entfernen?
            </h2>

            <form
              id="removeForm"
              onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                e.stopPropagation();
                const response = await addOrRemoveAnimals(
                  new FormData(e.currentTarget)
                );
                if (response.success) {
                  setIsSpotted(String(response.isSpotted));
                } else {
                  console.error(response.error);
                }
                changeFavoriteModal(false);
              }}
            >
              <input type="hidden" name="animalId" value={id} />
              <input type="hidden" name="isSpotted" value={isSpotted} />
              <input type="hidden" name="pathname" value={pathName} />

              <button
                type="submit"
                className="bg-red-600 text-slate-200 hover:text-gray-900 rounded-lg p-2 hover:bg-red-700 transition duration-300"
              >
                Tier entfernen
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
