"use client";

import { useSearchParams } from "next/navigation";
import ProfileListElement from "./SocialListElement";
import { useEffect, useState } from "react";
import getUsers from "@/app/actions/getUsers";
import { User } from "@supabase/supabase-js";

type UserType = {
  id: string;
  display_name: string;
  joyn_date: string;
};
export default function SocialList({
  user,
  following,
}: {
  user: User;
  following: string[];
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(
          Object.fromEntries(searchParams.entries()),
          user.id
        );
        setLoading(false);

        setUsers(data);
      } catch (error) {
        console.error("Error loading Animals:", error);
      }
    };
    loadUsers();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center gap-4  overflow-y-auto ">
      {users &&
        users.map((profile: UserType, index: number) => (
          <ProfileListElement
            key={profile.id}
            user={user}
            userId={profile.id}
            username={profile.display_name}
            profilepicture={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${profile.id}/ProfilePicture/ProfilePic.jpg`}
            profilelink={`/profilepage/${profile.display_name}`}
            following={following.includes(profile.id)}
          />
        ))}
    </div>
  );
}
