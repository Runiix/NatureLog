"use client";

import Image from "next/image";
import { Person } from "@mui/icons-material";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePicture({ user }: { user: any }) {
  const changeprofile = true;
  const profilePicUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfilePicture/ProfilePic.jpg`;
  const supabase = createClient();
  const router = useRouter();

  async function addOrChangeProfilePictures(event: any) {
    try {
      const file = event.target.files[0];
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated for Photo upload!");
      }
      const filePath = `/${user.id}/ProfilePicture/ProfilePic.jpg`;

      const { error: insertError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      router.refresh;
      if (insertError) {
        console.error(insertError);
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  }

  return (
    <div>
      <div>
        <div className="text-5xl flex items-center gap-2 sm:gap-4">
          {changeprofile ? (
            <label className="group">
              {profilePicUrl === "" ? (
                <Person className="text-5xl hover:cursor-pointer border-2 group-hover:text-slate-400 rounded-full w-20 h-20" />
              ) : (
                <Image
                  src={profilePicUrl}
                  alt="profileBanner"
                  className="z-10 object-cover rounded-full w-100 border-2 bg-gray-900 hover:cursor-pointer group-hover:opacity-90 h-100 aspect-square"
                  height={200}
                  width={200}
                  priority
                />
              )}
              <p className="hidden group-hover:flex absolute bottom-8 sm:bottom-14 ml-4 sm:ml-5 text-xs hover:cursor-pointer">
                change
              </p>
              <input
                type="file"
                id="photo-upload"
                onChange={addOrChangeProfilePictures}
                className="hidden"
              />
            </label>
          ) : profilePicUrl === "" ? (
            <Person className="text-5xl hover:cursor-pointer border-2 hover:text-slate-400 rounded-full " />
          ) : (
            <Image
              src={profilePicUrl}
              alt="profileBanner"
              className="z-10 object-cover rounded-full w-20 min-w-20 border-2 bg-gray-900 h-20"
              height={40}
              width={40}
            />
          )}
        </div>
      </div>
    </div>
  );
}
