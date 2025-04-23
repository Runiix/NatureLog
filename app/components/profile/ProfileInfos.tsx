"use client";

import { Add, Close, Edit, Instagram } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import changeTeam from "../../actions/changeTeam";
import { useParams } from "next/navigation";
import changeFavoriteAnimal from "@/app/actions/changeFavoriteAnimal";
import changeInstaLink from "@/app/actions/changeInstaLink";
import { User } from "@supabase/supabase-js";

export default function ProfileInfos({
  user,
  animalCount,
  teamIcon,
  favoriteAnimal,
  currUser,
  instaLink,
}: {
  user: User | any;
  animalCount: number;
  teamIcon: string | null;
  favoriteAnimal: string;
  currUser: boolean;
  instaLink: string | null;
}) {
  const collectionLink = currUser
    ? `/collectionpage/${user.user_metadata.displayName}`
    : `/collectionpage/${user.display_name}`;
  const [team, setTeam] = useState<string | null>(teamIcon);
  const [teamSelect, setTeamSelect] = useState(false);
  const [showEditFavoriteAnimal, setShowEditFavoriteAnimal] = useState(false);
  const [showEditInstaLink, setShowEditInstaLink] = useState(false);
  const [favorite, setFavorite] = useState(favoriteAnimal);
  const [insta, setInsta] = useState(instaLink);
  const params = useParams();
  const teamList = [
    {
      name: "wolf",
      src: "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/wolf-portrait.jpg",
      alt: "Wolf Icon",
    },
    {
      name: "kingfisher",
      src: "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/kingfisher-portrait.jpg",
      alt: "Eisvogel Icon",
    },
    {
      name: "adder",
      src: "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/adder-portrait.jpg",
      alt: "Kreuzotter Icon",
    },
    {
      name: "frog",
      src: "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/frog-portrait.jpg",
      alt: "Frosch Icon",
    },
    {
      name: "dragonfly",
      src: "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/dragonfly-portrait.jpg",
      alt: "Libelle Icon",
    },
  ];
  const handelFavoriteChange = async (formData: FormData) => {
    const { success } = await changeFavoriteAnimal(formData);
    if (success === false) {
      alert("Lieblingstier konnte nicht geändert werden");
    }
    const favoriteAnimal = formData.get("favorite_animal") as string;
    setFavorite(favoriteAnimal);
    setShowEditFavoriteAnimal(false);
  };
  const handelInstaChange = async (formData: FormData) => {
    const { success } = await changeInstaLink(formData);
    if (success === false) {
      alert("Link konnte nicht geändert werden");
    }
    const instaLink = formData.get("link") as string;
    setInsta(instaLink);
    setShowEditInstaLink(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-10 sm:text-xl border-b-2 border-gray-950 pb-2">
        <div>
          {currUser ? user.user_metadata.displayName : user.display_name}
        </div>
        <div className="flex gap-2 items-center">
          {insta ? (
            <a
              href={insta}
              rel="noopener noreferrer"
              target="_blank"
              className="hover:text-green-600"
            >
              <Instagram />
            </a>
          ) : (
            <Instagram />
          )}

          {currUser && (
            <Edit
              onClick={() => setShowEditInstaLink((prev) => !prev)}
              className="cursor-pointer hover:text-green-600"
            />
          )}
        </div>
      </div>
      <div className="flex justify-around gap-2 sm:gap-10">
        <div className="flex flex-col items-center  gap-2 relative">
          <div>Team</div>
          {currUser ? (
            <button
              aria-label="button for selecting a team"
              className="border-2 rounded-lg p-2 text-xl hover:scale-110 transition duration-300 flex justify-center items-center"
              onClick={() => setTeamSelect(!teamSelect)}
            >
              {team === null ? (
                <Add />
              ) : (
                <Image src={team} width={80} height={80} alt="" />
              )}
            </button>
          ) : (
            <div
              className={`border-2 rounded-lg p-2 text-xl  transition duration-300 flex justify-center items-center ${
                currUser && "hover:scale-110 "
              }`}
            >
              {team !== null && (
                <Image src={team} width={80} height={80} alt="" />
              )}
            </div>
          )}
          {teamSelect && (
            <div
              className=" bg-gray-900 top-36 -left-44 p-2 rounded-lg flex gap-2 absolute"
              onClick={() => setTeamSelect(false)}
            >
              {teamList.map((team) => (
                <Image
                  key={team.name}
                  src={team.src}
                  width={80}
                  height={80}
                  alt={team.alt}
                  className="rounded-lg cursor-pointer hover:opacity-90"
                  onClick={() =>
                    changeTeam(team.name, user.id).then(() => setTeam(team.src))
                  }
                />
              ))}
            </div>
          )}
        </div>
        <Link
          href={collectionLink}
          className=" flex flex-col gap-2 items-center text-center"
        >
          <p>Arten</p>
          <div className="border-2 rounded-lg px-4 py-2 text-xl hover:bg-gray-800 hover:scale-110 transition duration-300">
            {animalCount}
          </div>
        </Link>
        <div className="flex flex-col gap-2 items-center">
          <p>Lieblingstier</p>
          <div className="flex gap-2">
            <div
              className={` ${
                currUser && "hover:text-green-600 cursor-pointer"
              }`}
            >
              {favorite}
            </div>
            {currUser && (
              <Edit
                onClick={() => setShowEditFavoriteAnimal((prev) => !prev)}
                className="cursor-pointer hover:text-green-600"
              />
            )}
          </div>
          {showEditFavoriteAnimal && currUser && (
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center">
              <form className="bg-gray-900 rounded-lg w-10/12 py-10 flex flex-col items-center justify-center gap-4 relative max-w-[50%] shadow-lg shadow-black">
                {" "}
                <h3 className="xl:text-xl text-center">
                  Geben sie ein neues Tier ein, dass Sie als Favorit speichern
                  möchten.
                </h3>
                <button
                  aria-label="button for opening the edit favorite animal form"
                  onClick={() => setShowEditFavoriteAnimal(false)}
                  className="hover:text-red-600 absolute top-1 right-2"
                >
                  <Close />
                </button>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    name="favorite_animal"
                    placeholder="Favorit eingeben"
                    className="w-44 sm:w-64 border border-slate-200 rounded-lg bg-gray-900 p-4"
                  />
                  <button
                    aria-label="button for changing the favorite animal"
                    formAction={handelFavoriteChange}
                    className="bg-green-600 rounded-lg p-4 hover:bg-green-700 hover:text-gray-900"
                  >
                    Ändern
                  </button>
                </div>
              </form>
            </div>
          )}
          {showEditInstaLink && currUser && (
            <div className="fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center">
              <form className="bg-gray-900 rounded-lg w-10/12 py-10 flex flex-col items-center justify-center gap-4 relative max-w-[50%] shadow-lg shadow-black">
                {" "}
                <h3 className="xl:text-xl text-center">
                  Geben Sie Ihren Instagram Link ein.
                </h3>
                <button
                  aria-label="button for opening the edit instagram link form"
                  onClick={() => setShowEditInstaLink(false)}
                  className="text-red-600 absolute top-1 right-2"
                >
                  <Close />
                </button>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    name="link"
                    placeholder="Link eingeben"
                    className="w-44 sm:w-64 border border-slate-200 rounded-lg bg-gray-900 p-4"
                  />
                  <button
                    aria-label="button for changing the instagram link"
                    formAction={handelInstaChange}
                    className="bg-green-600 rounded-lg p-4 hover:bg-green-700 hover:text-gray-900"
                  >
                    Ändern
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
