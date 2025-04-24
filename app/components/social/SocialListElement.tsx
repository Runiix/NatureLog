import follow from "@/app/actions/follow";
import unfollow from "@/app/actions/unfollow";
import { createClient } from "@/utils/supabase/client";
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
      className="py-4 rounded-lg bg-gray-900 w-80 sm:w-96 shadow-md shadow-gray-800 transition-all duration-200 hover:bg-gradient-to-br from-green-600 via-gray-900 to-gray-900 "
    >
      <div
        className="flex items-center justify-between
      mx-6 "
      >
        {profilePicExists === true ? (
          <Image
            src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${userId}/ProfilePicture/ProfilePic.jpg?t=${new Date().getTime()}`}
            alt="Profilbild"
            width="200"
            height="200"
            className="rounded-full w-16 h-16 object-cover"
            unoptimized
          />
        ) : (
          <Avatar />
        )}
        <h2>{username}</h2>
        <button
          onClick={handleFollowing}
          className={`${
            isFollowing
              ? " hover:text-red-600"
              : "bg-green-600 rounded-lg p-2 text-gray-900 hover:bg-green-600 hover:text-slate-200"
          }`}
        >
          {isFollowing ? "entfolgen" : "folgen"}
        </button>
      </div>
    </Link>
  );
}
