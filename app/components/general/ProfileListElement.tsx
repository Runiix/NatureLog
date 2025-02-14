import { createClient } from "@/utils/supabase/client";
import { Avatar } from "@mui/material";
import { SupabaseClient, User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type ProfileElement = {
  username: string;
  profilepicture: string;
  profilelink: string;
};
// const checkForProfilePic = async (supabase: SupabaseClient, user: User) => {
//   const { data: listData, error: listError } = await supabase.storage
//     .from("profiles")
//     .list(user?.id + "/ProfilePicture/", {
//       limit: 2,
//       offset: 0,
//       sortBy: { column: "name", order: "asc" },
//     });
//   if (listError) {
//     console.error(listError);
//     return false;
//   }
//   const filteredData = listData.filter(
//     (item: any) => item.name !== ".emptyFolderPlaceholder"
//   );
//   if (filteredData.length === 0) {
//     return false;
//   }
//   return true;
// };

export default function ProfileListElement({
  username,
  profilepicture,
  profilelink,
}: ProfileElement) {
  return (
    <Link
      href={profilelink}
      className="py-4 rounded-md bg-gray-950 w-80 sm:w-96 shadow-md shadow-gray-800 hover:bg-gray-900 transition-all duration-200"
    >
      <div className="flex gap-8 items-center justify-around">
        <Avatar />
        <h2>{username}</h2>
      </div>
    </Link>
  );
}
