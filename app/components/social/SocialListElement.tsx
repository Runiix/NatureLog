import follow from "@/app/actions/follow";
import unfollow from "@/app/actions/unfollow";
import { createClient } from "@/utils/supabase/client";
import { Add, Favorite } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { SupabaseClient, User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type ProfileElement = {
  username: string;
  userId: string;
  profilepicture: string;
  profilelink: string;
  following: boolean;
  user: User;
};
const checkForProfilePic = async (supabase: SupabaseClient, userId: string) => {
  const { data: listData, error: listError } = await supabase.storage
    .from("profiles")
    .list(userId + "/ProfilePicture/", {
      limit: 2,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (listError) {
    console.error(listError);
    return false;
  }
  const filteredData = listData.filter(
    (item: { name: string }) => item.name !== ".emptyFolderPlaceholder"
  );
  if (filteredData.length === 0) {
    return false;
  }
  return true;
};

export default function SocialListElement({
  user,
  username,
  userId,
  profilelink,
  following,
}: ProfileElement) {
  const supabase = createClient();
  const [isFollowing, setIsFollowing] = useState(following);
  const [profilePicExists, setProfilePicExists] = useState(false);
  useEffect(() => {
    const checkProfilePic = async () => {
      const exists = await checkForProfilePic(supabase, userId);
      setProfilePicExists(exists);
    };
    checkProfilePic();
  }, [user, supabase]);
  const handleFollowing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    following ? unfollow(user.id, userId) : follow(user.id, userId);
    setIsFollowing(!isFollowing);
  };
  return (
    <Link
      href={profilelink}
      className="shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 p-2 pr-2  rounded-lg  hover:cursor-pointer hover:from-green-600 hover:to-gray-950 w-80 sm:w-96  h-20  flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        {profilePicExists === true ? (
          <Image
            src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${userId}/ProfilePicture/ProfilePic.jpg?t=${new Date().getTime()}`}
            alt="Profilbild"
            width="200"
            height="200"
            className="rounded-full size-16 object-cover"
            unoptimized
          />
        ) : (
          <Avatar />
        )}
        <h2>{username}</h2>
      </div>
      <button
        onClick={handleFollowing}
        className={`${
          isFollowing
            ? "  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-red-600 p-2  rounded-lg  hover:cursor-pointer hover:from-red-600 hover:to-gray-950"
            : "rounded-lg p-2 hover:bg-green-600 hover:text-slate-200"
        }`}
        aria-label="NatureLogger folgen oder entfolgen"
      >
        {isFollowing ? (
          <Favorite className="text-green-600 hover:text-red-600 target:text-red-600" />
        ) : (
          <Add />
        )}
      </button>
    </Link>
  );
}
