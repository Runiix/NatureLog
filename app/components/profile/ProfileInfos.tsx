"use client";

import { Add, Edit, Instagram } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import changeTeam from "../../actions/changeTeam";
import { useParams } from "next/navigation";
import changeFavoriteAnimal from "@/app/actions/changeFavoriteAnimal";

export default function ProfileInfos({
  user,
  animalCount,
  teamIcon,
  favoriteAnimal,
  currUser,
}: {
  user: any;
  animalCount: number;
  teamIcon: string;
  favoriteAnimal: string;
  currUser: boolean;
}) {
  const collectionLink = currUser
    ? `/collectionpage/${user.user_metadata.displayName}`
    : `/collectionpage/${user.display_name}`;
  const [team, setTeam] = useState(teamIcon);
  const [teamSelect, setTeamSelect] = useState(false);
  const [showEditFavoriteAnimal, setShowEditFavoriteAnimal] = useState(false);
  const [favorite, setFavorite] = useState(favoriteAnimal);
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
  const handelFavoriteChange = (formData: FormData) => {
    changeFavoriteAnimal;
    const favoriteAnimal = formData.get("favorite_animal") as string;
    setFavorite(favoriteAnimal);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-10 sm:text-xl border-b-2 border-gray-950 pb-2">
        <div>{user.user_metadata.displayName}</div>
        <div>Mitgleid seit: {user.created_at.split("T")[0]}</div>
        <Instagram />
      </div>
      <div className="flex justify-around gap-2 sm:gap-10">
        <div className="flex flex-col items-center  gap-2">
          <div>Team</div>
          {currUser ? (
            <button
              className="border-2 rounded-lg p-2 text-xl hover:bg-gray-800 hover:scale-110 transition duration-300 flex justify-center items-center"
              onClick={() => setTeamSelect(!teamSelect)}
            >
              {team === "none" ? (
                <Add />
              ) : (
                <Image src={team} width={80} height={80} alt="" />
              )}
            </button>
          ) : (
            <Image src={team} width={80} height={80} alt="" />
          )}
          {teamSelect && (
            <div
              className=" bg-gray-800 p-2 rounded-lg flex gap-2 absolute "
              onClick={() => setTeamSelect(false)}
            >
              {teamList.map((team) => (
                <Image
                  key={team.name}
                  src={team.src}
                  width={80}
                  height={80}
                  alt={team.alt}
                  className="rounded-full cursor-pointer hover:opacity-90"
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
        <div className="flex flex-col gap-2 items-center relative">
          <p>Lieblingstier</p>
          <div
            className={` ${currUser && "hover:text-green-600 cursor-pointer"}`}
            onClick={() => setShowEditFavoriteAnimal((prev) => !prev)}
          >
            {favorite}
          </div>
          {showEditFavoriteAnimal && currUser && (
            <form className="space-x-2 absolute flex top-16">
              {" "}
              <input
                type="text"
                name="favorite_animal"
                placeholder="favorit eingeben"
                className="w-36 border border-slate-200 rounded-lg bg-gray-900 p-1"
              />
              <button formAction={handelFavoriteChange}>
                <Edit />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
