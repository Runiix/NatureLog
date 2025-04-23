"use client";

import { addOrRemoveAnimals } from "../../actions/addOrRemoveAnimal";
import { usePathname } from "next/navigation";
import { Add, Favorite } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";

export default function FavoriteButton({
  user,
  id,
  isSpotted,
  styles,
  changeFavoriteModal,
  changeSpotted,
}: {
  user: User;
  id: number;
  isSpotted: string;
  styles?: string;
  changeFavoriteModal: React.Dispatch<React.SetStateAction<boolean>>;
  changeSpotted: React.Dispatch<React.SetStateAction<string>>;
}) {
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
  }
  function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    changeFavoriteModal(true);
  }
  return (
    <div className={styles}>
      <div>
        {user && (
          <div>
            {isSpotted === "true" ? (
              <button onClick={handleButtonClick}>
                {" "}
                <Favorite className="text-green-600" />
              </button>
            ) : (
              <form
                id="spottedForm"
                onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const response = await addOrRemoveAnimals(
                    new FormData(e.currentTarget)
                  );
                  if (response.success) {
                    changeSpotted(String(response.isSpotted));
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
                  <Add className="text-slate-200" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
