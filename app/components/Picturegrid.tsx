"use client";

import { createClient } from "@/utils/supabase/client";
import { Delete, Edit } from "@mui/icons-material";
import Image from "next/image";
import { useEffect, useState } from "react";
import getProfileGrid from "../actions/getProfileGrid";
import { CircleLoader } from "react-spinners";

export default function PictureGrid({
  user,
  currUser,
}: {
  user: any;
  currUser: boolean;
}) {
  const supabase = createClient();
  const [profileGridFull, setProfileGridFull] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [profileGrid, setProfileGrid] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [imageModal, setImageModal] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProfileGrid = async () => {
    const gridData = await getProfileGrid(user.id);
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
    setLoading(false);
  }, [refresh]);

  async function addProfileGridImage(event: any) {
    setLoading(true);
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

      if (listData === null || listData.length < 13) {
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
    setLoading(true);
    const file = event.target.files[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(file, oldImageUrl);
    if (!user) {
      throw new Error("User not authenticated for Photo upload!");
    }
    const filePath = `/${user.id}/ProfileGrid/${file.name}`;

    const { error: removeError } = await supabase.storage
      .from("profiles")
      .remove([oldImageUrl]);
    if (removeError) {
      console.error(removeError);
    }
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
  };
  const removeProfileGridImage = async (url: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.storage
      .from("profiles")
      .remove([url]);
    if (insertError) {
      console.error(insertError);
    }
    setRefresh(!refresh);
    setProfileGridFull(false);
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
              onClick={() =>
                setImageModal(
                  `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfileGrid/${profileGrid[index].name}`
                )
              }
            />
            {currUser && (
              <div className="flex items-center">
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
                <button
                  className="group cursor-pointer"
                  onClick={() =>
                    removeProfileGridImage(
                      `${user.id}/ProfileGrid/${profileGrid[index].name}`
                    )
                  }
                >
                  <Delete className="absolute bottom-4 left-4 hover:bg-gray-700 hover:bg-opacity-40 rounded-full hover:scale-125" />
                </button>
              </div>
            )}
          </div>
        ))}
      {!profileGridFull && currUser && (
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
      {imageModal !== "" && (
        <div
          className="fixed top-0 left-0 w-full h-full z-10 bg-slate-950 bg-opacity-30 flex items-center justify-center"
          onClick={() => setImageModal("")}
        >
          {" "}
          <Image
            src={imageModal}
            alt=""
            width={1920}
            height={1920}
            className="relative m-auto z-20"
          />
        </div>
      )}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full z-10 bg-slate-950 bg-opacity-30 flex items-center justify-center">
          Bild wird hochgeladen
          <CircleLoader color="#16A34A" />
        </div>
      )}
    </div>
  );
}
