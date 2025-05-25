"use client";
import { Delete, Edit } from "@mui/icons-material";
import Image from "next/image";
import { useEffect, useState } from "react";
import getProfileGrid from "../../actions/getProfileGrid";
import { CircleLoader } from "react-spinners";
import addProfileGridImage from "../../actions/addProfileGridImage";
import removeProfileGridImage from "../../actions/removeProfileGridImage";
import changeProfileGridImage from "../../actions/changeProfileGridImage";
import imageCompression from "browser-image-compression";
import { User } from "@supabase/supabase-js";

type ProfileGridImage = {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
};
export default function PictureGrid({
  user,
  currUser,
}: {
  user: User;
  currUser: boolean;
}) {
  const [profileGridFull, setProfileGridFull] = useState(false);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [oldModalUrl, setOldModalUrl] = useState("");
  const [profileGrid, setProfileGrid] = useState<ProfileGridImage[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [imageModal, setImageModal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfileGrid = async () => {
      const gridData = await getProfileGrid(user.id);
      if (Array.isArray(gridData)) {
        setProfileGrid(
          gridData.map((item: any) => ({
            ...item,
            metadata: {
              eTag: item.metadata.eTag || "",
              size: item.metadata.size || 0,
              mimetype: item.metadata.mimetype || "",
              cacheControl: item.metadata.cacheControl || "",
              lastModified: item.metadata.lastModified || "",
              contentLength: item.metadata.contentLength || 0,
              httpStatusCode: item.metadata.httpStatusCode || 0,
            },
          }))
        );
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
      const options1 = {
        maxSizeMB: 0.02,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      const options2 = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options1);
        const modalFile = await imageCompression(file, options2);

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("modalFile", modalFile);
        formData.append("fileName", file.name);
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
  const handleUrlChange = (index: number) => {
    setOldImageUrl(`${user.id}/ProfileGrid/${profileGrid[index].name}`);
    setOldModalUrl(`${user.id}/ProfileGridModals/${profileGrid[index].name}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options1 = {
        maxSizeMB: 0.02,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      const options2 = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options1);
        const modalFile = await imageCompression(file, options2);

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("modalFile", modalFile);
        formData.append("old_file", oldImageUrl);
        formData.append("old_modalFile", oldModalUrl);
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

  const handleFileDelete = async (fileUrl: string, modalUrl: string) => {
    const formData = new FormData();
    formData.append("file", fileUrl);
    formData.append("modalFile", modalUrl);
    const response = await removeProfileGridImage(formData);
    if (response) {
      setProfileGridFull(response.profileGridFull);
      setLoading(false);
      setRefresh((prev) => !prev);
    }
  };

  return (
    <div>
      <h2 className="text-xl">Lieblingsfotos</h2>
      <div className="items-center justify-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  gap-1 sm:gap-4 border-t-2 border-gray-200 pt-4">
        {profileGrid &&
          profileGrid.map((image: ProfileGridImage, index: number) => (
            <div key={profileGrid[index].id} className="relative">
              <Image
                unoptimized
                src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfileGrid/${profileGrid[index].name}`}
                width={200}
                height={200}
                alt=""
                className="rounded-lg object-cover hover:opacity-90 aspect-square cursor-pointer"
                onClick={() =>
                  setImageModal(
                    `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${user.id}/ProfileGridModals/${profileGrid[index].name}`
                  )
                }
              />
              {currUser && (
                <div className="flex items-center">
                  <label
                    className="group cursor-pointer"
                    onClick={() => handleUrlChange(index)}
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
                        `${user.id}/ProfileGrid/${profileGrid[index].name}`,
                        `${user.id}/ProfileGridModal/${profileGrid[index].name}`
                      )
                    }
                    aria-label="Bild aus Liebligsbildern entfernen"
                  >
                    <Delete className="absolute bottom-4 left-4 hover:bg-gray-700 hover:bg-opacity-40 rounded-full hover:scale-125" />
                  </button>
                </div>
              )}
            </div>
          ))}
        {!profileGridFull && currUser && (
          <label className="group border-2 rounded-lg w-10 h-10 flex justify-center items-center cursor-pointer hover:bg-gray-800 hover:scale-110 p-16 ml-5">
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
            className="fixed top-0 left-0 w-full h-full z-10 bg-black/70 flex items-center justify-center"
            onClick={() => setImageModal("")}
          >
            {" "}
            <Image
              unoptimized
              src={imageModal}
              alt=""
              loading="lazy"
              width={1920}
              height={1080}
              className="relative m-auto z-20 sm:w-2/3 max-h-full object-contain"
            />
          </div>
        )}
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full z-10 bg-black/70 flex items-center justify-center">
            Bild wird hochgeladen
            <CircleLoader color="#16A34A" />
          </div>
        )}
      </div>
    </div>
  );
}
