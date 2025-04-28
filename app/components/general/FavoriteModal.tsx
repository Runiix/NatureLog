import { addOrRemoveAnimals } from "@/app/actions/addOrRemoveAnimal";
import { Close } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import React from "react";
import Modal from "./Modal";

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
  return (
    <div>
      {" "}
      {favoriteModal && (
        <Modal closeModal={() => changeFavoriteModal(false)}>
          <h2 className="sm:text-xl text-center text-slate-200">
            Möchten sie diese Tier wirklich aus ihrer Sammlung entfernen?
          </h2>

          <form
            id="removeForm"
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
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
              className="bg-red-600 hover:text-gray-900 rounded-lg p-4 text-xl hover:bg-red-700 transition duration-300"
            >
              Tier entfernen
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
