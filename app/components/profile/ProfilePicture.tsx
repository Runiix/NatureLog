"use client";

import Image from "next/image";
import { Person } from "@mui/icons-material";
import { useState, useEffect } from "react";
import changeProfilePicture from "../../actions/changeProfilePicture";
import { CircleLoader } from "react-spinners";
import imageCompression from "browser-image-compression";

export default function ProfilePicture({
  userId,
  currUser,
  profilePic,
  profilePicUrl,
}: {
  userId: string;
  currUser: boolean;
  profilePic: boolean;
  profilePicUrl: string;
}) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(profilePicUrl);
  const [loading, setLoading] = useState(false);
  const [profilePicExists, setProfilePicExists] = useState(profilePic);

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeKB: 100, // Target size
        maxWidthOrHeight: 1920, // Resize if needed
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("exists", profilePicExists.toString());

        const response = await changeProfilePicture(formData);
        if (response) {
          setProfilePictureUrl(
            `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${userId}/ProfilePicture/ProfilePic.jpg?t=${new Date().getTime()}`
          );
          setProfilePicExists(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };

  return (
    <div>
      <div>
        <div className="text-5xl flex items-center gap-2 sm:gap-4">
          {loading ? (
            <CircleLoader color="#16A34A" />
          ) : (
            <label className="group">
              {profilePicExists === false ? (
                <Person
                  className={`text-5xl border-2 rounded-full w-20 h-20 ${
                    currUser && "group-hover:text-slate-400 cursor-pointer"
                  }`}
                />
              ) : (
                <Image
                  src={profilePictureUrl}
                  alt="profileBanner"
                  className={`z-10 object-cover rounded-full w-100 border-2 bg-gray-900 ${
                    currUser && "hover:cursor-pointer group-hover:opacity-90"
                  }  h-100 aspect-square`}
                  height={200}
                  width={200}
                  priority
                  unoptimized
                />
              )}
              <p className="hidden group-hover:flex absolute bottom-8 sm:bottom-14 ml-4 sm:ml-5 text-xs hover:cursor-pointer">
                change
              </p>
              {currUser && (
                <input
                  type="file"
                  id="photo-upload"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
              )}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
