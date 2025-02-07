"use client";
import { Delete, Edit } from "@mui/icons-material";
import Image from "next/image";
import { useEffect, useState } from "react";
import getProfileGrid from "../actions/getProfileGrid";
import { CircleLoader } from "react-spinners";
import addProfileGridImage from "../actions/addProfileGridImage";
import removeProfileGridImage from "../actions/removeProfileGridImage";
import changeProfileGridImage from "../actions/changeProfileGridImage";
import imageCompression from "browser-image-compression";

export default function PictureGrid({
  user,
  currUser,
}: {
  user: any;
  currUser: boolean;
}) {
  const [profileGridFull, setProfileGridFull] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [profileGrid, setProfileGrid] = useState<any>([]);
  const [refresh, setRefresh] = useState(false);
  const [imageModal, setImageModal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileGrid = async () => {
      const gridData = await getProfileGrid(user.id);
      if (Array.isArray(gridData)) {
        setProfileGrid(gridData);
        if (gridData.length === 12) {
          setProfileGridFull(true);
        }
      } else {
        console.error("Failed to load profile grid:", gridData.error);
      }
    };
    loadProfileGrid();
    setLoading(false);
  }, [refresh, user.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 5, // Target size
        maxWidthOrHeight: 1920, // Resize if needed
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("fileName", file.name);
        console.log("Uploading", compressedFile.name);
        const response = await addProfileGridImage(formData);
        if (response) {
          setProfileGridFull(response.profileGridFull);
          setLoading(false);
          setRefresh((prev) => !prev);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("old_file", oldImageUrl);
        formData.append("fileName", file.name);

        const response = await changeProfileGridImage(formData);
        if (response) {
          setLoading(false);
          setRefresh((prev) => !prev);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };

  const handleFileDelete = async (url: string) => {
    const formData = new FormData();
    formData.append("file", url);

    const response = await removeProfileGridImage(formData);
    if (response) {
      setProfileGridFull(response.profileGridFull);
      setLoading(false);
      setRefresh((prev) => !prev);
    }
  };

  return (
    <div className="items-center justify-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  gap-1 sm:gap-4 border-t-2 border-gray-950 pt-4">
      {profileGrid &&
        profileGrid.map((imageId: number, index: number) => (
          <div key={profileGrid[index].id} className="relative">
            <Image
              src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfileGrid/${profileGrid[index].name}`}
              width={200}
              height={200}
              alt=""
              className="rounded-lg object-cover aspect-square scale-95 sm:scale-100 hover:opacity-90 cursor-pointer"
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
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  className="group cursor-pointer"
                  onClick={() =>
                    handleFileDelete(
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
            onChange={handleFileUpload}
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
