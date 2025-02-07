"use client";

import { Add } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import changeTeam from "../actions/changeTeam";
import { useParams } from "next/navigation";

export default function ProfileInfos({
  user,
  animalCount,
  teamIcon,
  currUser,
}: {
  user: any;
  animalCount: number;
  teamIcon: string;
  currUser: boolean;
}) {
  const collectionLink = currUser
    ? `/collectionpage/${user.user_metadata.displayName}`
    : `/collectionpage/${user.display_name}`;
  const [team, setTeam] = useState(teamIcon);
  const [teamSelect, setTeamSelect] = useState(false);
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

  return (
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
        <div>Arten</div>
        <div className="border-2 rounded-lg px-4 py-2 text-xl hover:bg-gray-800 hover:scale-110 transition duration-300">
          {animalCount}
        </div>
      </Link>
      <div className="flex flex-col items-center">
        <div>Bundesland</div>
        <div>NRW</div>
      </div>
    </div>
  );
}
