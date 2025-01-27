"use client";

import { createClient } from "@/utils/supabase/client";
import { Add, Edit } from "@mui/icons-material";
import Image from "next/image";
import { useEffect, useState } from "react";
import getProfileGrid from "../actions/getProfileGrid";
import { profile } from "console";

export default function PictureGrid({ user }: any) {
  const supabase = createClient();
  const [profileGridFull, setProfileGridFull] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [profileGrid, setProfileGrid] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const loadProfileGrid = async () => {
    const gridData = await getProfileGrid();
    console.log("Grid Data", gridData);
    if (Array.isArray(gridData)) {
      setProfileGrid(gridData); // Set the resolved data
      if (gridData.length === 12) {
        setProfileGridFull(true);
      }
    } else {
      console.error("Failed to load profile grid:", gridData.error);
    }
  };

  useEffect(() => {
    loadProfileGrid();
  }, [refresh]);

  async function addProfileGridImage(event: any) {
    try {
      const file = event.target.files[0];
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated for Photo upload!");
      }
      const filePath = `/${user.id}/ProfileGrid/${file.name}`;

      const { data: listData, error: listError } = await supabase.storage
        .from("profiles")
        .list(user?.id + "/ProfileGrid/", {
          limit: 13,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });
      if (listError) {
        console.error(listError);
      }

      if (listData === null || listData.length < 11) {
        const { error: insertError } = await supabase.storage
          .from("profiles")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });
        if (insertError) {
          console.error(insertError);
        }
        setRefresh(!refresh);
      } else {
        setProfileGridFull(true);
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  }

  const changeProfileGridImage = async (event: any) => {
    const file = event.target.files[0];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(file, oldImageUrl);

    const { error: insertError } = await supabase.storage
      .from("profiles")
      .update(oldImageUrl, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (insertError) {
      console.error(insertError);
    }
    setRefresh(!refresh);
  };

  return (
    <div className="items-center justify-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 border-t-2 border-gray-950 pt-4">
      {profileGrid &&
        profileGrid.map((imageId: number, index: number) => (
          <div key={profileGrid[index].id} className="relative">
            <Image
              src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfileGrid/${profileGrid[index].name}`}
              width={200}
              height={200}
              alt=""
              className="rounded-lg object-cover aspect-square hover:opacity-90 cursor-pointer"
              priority
              onClick={() => setShowImageModal(!showImageModal)}
            />
            <label
              className="group cursor-pointer"
              onClick={() =>
                setOldImageUrl(
                  `${user.id}/ProfileGrid/${profileGrid[index].name}`
                )
              }
            >
              <Edit className="absolute bottom-4 right-4 hover:bg-gray-700 hover:bg-opacity-40 rounded-full hover:scale-125" />
              <input
                type="file"
                id="photo-upload"
                onChange={changeProfileGridImage}
                className="hidden"
              />
            </label>
          </div>
        ))}
      {!profileGridFull && (
        <label className="group border-2 rounded-lg w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-gray-800 hover:scale-110 p-20 ml-5">
          <div className="text-xl">{profileGrid.length}/12</div>
          <input
            type="file"
            id="photo-upload"
            onChange={addProfileGridImage}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
