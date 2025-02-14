"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileListElement from "./ProfileListElement";
import { useEffect, useState } from "react";
import getUsers from "@/app/actions/getUsers";

export default function ProfileList() {
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const { replace } = useRouter();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathName}?${params.toString()}`);
    setQuery(term);
  };
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(Object.fromEntries(searchParams.entries()));
        setLoading(false);

        setUsers(data);
      } catch (error) {
        console.error("Error loading Animals:", error);
      }
    };
    loadUsers();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center text-center pt-32 gap-6">
      <h1 className="text-slate-900 text-2xl">Profile</h1>
      <div className="flex items-center gap-2 border-">
        <input
          id="Search"
          value={query?.toString()}
          className=" z-0 bg-gray-900 border border-slate-100 hover:bg-green-600 hover:text-gray-950 hover:cursor-pointer p-3 px-5 rounded-md"
          type="text"
          placeholder="Tier Suchen"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        {users &&
          users.map((profile: any, index: number) => (
            <ProfileListElement
              key={profile.id}
              username={profile.display_name}
              profilepicture={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${profile.id}/ProfilePicture/ProfilePic.jpg`}
              profilelink={`/profilepage/${profile.display_name}`}
            />
          ))}
      </div>
    </div>
  );
}
