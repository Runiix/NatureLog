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
}: {
  user: any;
  animalCount: number;
  teamIcon: string;
}) {
  const collectionLink = `/collectionpage/${user.id}`;
  const [team, setTeam] = useState(teamIcon);
  const [teamSelect, setTeamSelect] = useState(false);
  const params = useParams();
  console.log(params.username);

  return (
    <div className="flex gap-10">
      <div className="flex flex-col items-center  gap-2">
        <div>Team</div>
        {params.username === user.user_metadata.displayName ? (
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
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/wolf-portrait.jpg"
              width={80}
              height={80}
              alt=""
              className="rounded-full cursor-pointer hover:opacity-90"
              onClick={() =>
                changeTeam("wolf", user.id).then(() =>
                  setTeam(
                    "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/wolf-portrait.jpg"
                  )
                )
              }
            />
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/kingfisher-portrait.jpg"
              width={80}
              height={80}
              alt=""
              className="rounded-full cursor-pointer hover:opacity-90"
              onClick={() =>
                changeTeam("kingfisher", user.id).then(() =>
                  setTeam(
                    "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/kingfisher-portrait.jpg"
                  )
                )
              }
            />
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/adder-portrait.jpg"
              width={80}
              height={80}
              alt=""
              className="rounded-full cursor-pointer hover:opacity-90"
              onClick={() =>
                changeTeam("adder", user.id).then(() =>
                  setTeam(
                    "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/adder-portrait.jpg"
                  )
                )
              }
            />
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/frog-portrait.jpg"
              width={80}
              height={80}
              alt=""
              className="rounded-full cursor-pointer hover:opacity-90"
              onClick={() =>
                changeTeam("frog", user.id).then(() =>
                  setTeam(
                    "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/frog-portrait.jpg"
                  )
                )
              }
            />
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/dragonfly-portrait.jpg"
              width={80}
              height={80}
              alt=""
              className="rounded-full cursor-pointer hover:opacity-90"
              onClick={() =>
                changeTeam("dragonfly", user.id).then(() =>
                  setTeam(
                    "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profile_icons/teams/dragonfly-portrait.jpg"
                  )
                )
              }
            />
          </div>
        )}
      </div>
      <Link href={collectionLink} className=" flex flex-col gap-2 items-center">
        <div>Fotografierte Arten</div>
        <div className="border-2 rounded-lg px-4 py-2 text-xl hover:bg-gray-800 hover:scale-110 transition duration-300">
          {animalCount}
        </div>
      </Link>
      <div>
        <div>Bundesland</div>
        <div>Karte</div>
      </div>
    </div>
  );
}
