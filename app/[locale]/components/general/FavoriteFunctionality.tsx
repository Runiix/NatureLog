"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import FavoriteButton from "./FavoriteButton";
import FavoriteModal from "./FavoriteModal";
import { User } from "@supabase/supabase-js";

export default function FavoriteFunctionality({
  user,
  id,
  spottedList,
  buttonStyles,
  modalStyles,
}: {
  user: User;
  id: number;
  spottedList: number[];
  buttonStyles?: string;
  modalStyles?: string;
}) {
  const [isSpotted, setIsSpotted] = useState("false");
  const pathname = usePathname();
  const [favoriteModal, setFavoriteModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkIfSpotted = () => {
      if (spottedList !== undefined) {
        const isSpotted = spottedList.some((item) => item === id);
        if (isSpotted) setIsSpotted("true");
      }
    };
    checkIfSpotted();
  }, [id, spottedList, searchParams]);

  return (
    <div>
      {user && (
        <div>
          <FavoriteButton
            user={user}
            id={id}
            isSpotted={isSpotted}
            styles={buttonStyles}
            changeFavoriteModal={() => setFavoriteModal(!favoriteModal)}
            changeSpotted={(string) => setIsSpotted(string)}
          />
          {favoriteModal && (
            <FavoriteModal
              user={user}
              id={id}
              styles={modalStyles}
              favoriteModal={favoriteModal}
              changeFavoriteModal={() => setFavoriteModal(!favoriteModal)}
              isSpotted={isSpotted}
              setIsSpotted={setIsSpotted}
              pathName={pathname}
            />
          )}
        </div>
      )}
    </div>
  );
}
