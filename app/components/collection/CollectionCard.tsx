"use client";

import { Add, Edit, Favorite } from "@mui/icons-material";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import Link from "next/link";
import { CircleLoader } from "react-spinners";
import addCollectionImage from "../../actions/addCollectionImage";
import FavoriteButton from "../general/FavoriteButton";
import imageCompression from "browser-image-compression";
import black from "@/app/assets/images/black.webp";

export default function CollectionCard({
  id,
  common_name,
  scientific_name,
  population_estimate,
  endangerment_status,
  size_from,
  size_to,
  sortBy,
  imageUrl,
  user,
  currUser,
  spottedList,
  animalImageExists,
}: {
  id: number;
  common_name: string;
  scientific_name: string;
  population_estimate: string;
  endangerment_status: string;
  size_from: string;
  size_to: string;
  sortBy: string;
  imageUrl: string;
  user: any;
  currUser?: "false";
  spottedList: number[];
  animalImageExists: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const [src, setSrc] = useState<string | StaticImageData>(imageUrl);
  const [imageModal, setImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageExists, setImageExists] = useState(animalImageExists);

  const handleError = () => {
    setSrc(black);
  };
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    setLoading(true);

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 0.02,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      console.log(`originalFile size ${file.size / 1024 / 1024} MB`);

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("common_name", common_name);
        formData.append("id", String(id));
        console.log(
          `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
        ); // smaller than maxSizeMB

        const response = await addCollectionImage(formData);
        if (response) {
          if (imageExists === false) {
            setImageExists(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col w-44 sm:w-80 bg-gray-900 rounded-lg shadow-md shadow-gray-800">
        {imageExists ? (
          <div className="group relative flex items-end justify-end cursor-pointer">
            <Image
              src={src + `?t=${new Date().getTime()}`}
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-32 sm:h-48 rounded-t-lg hover:opacity-80   transition-opacity duration-[1s] opacity-0"
              onLoadingComplete={(image) => image.classList.remove("opacity-0")}
              onError={handleError}
              onClick={() => setImageModal((prev) => !prev)}
              unoptimized
            />
            {currUser !== "false" && (
              <label className="absolute sm:mr-4 sm:mb-4">
                {loading ? (
                  <CircleLoader color="#16A34A" />
                ) : (
                  <Edit className="hover:text-green-600 hover:bg-slate-200 rounded-full w-10 h-10 p-2 cursor-pointer" />
                )}
                <input
                  type="file"
                  id="photo-upload"
                  onChange={(e) => handleFileUpload(e, id)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="group relative flex items-center justify-center cursor-pointer">
            <Image
              src={black}
              alt="Placeholder"
              width={300}
              height={200}
              className="object-cover w-full rounded-t-lg hover:opacity-90 h-32 sm:h-48"
              onError={handleError}
              unoptimized
            />
            {currUser !== "false" && (
              <label className="absolute">
                {loading ? (
                  <CircleLoader color="#16A34A" />
                ) : (
                  <Add className="group-hover:text-green-600 group-hover:bg-slate-200 rounded-full w-10 h-10 cursor-pointer" />
                )}
                <input
                  type="file"
                  id="photo-upload"
                  onChange={(e) => handleFileUpload(e, id)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
        <Link
          href={link}
          className=" p-4 w-full flex justify-between items-center"
        >
          <div>
            <h2 className="text-xs sm:text-2xl">{common_name}</h2>
            <h3 className="text-[0.5rem] sm:text-sm">
              {sortBy === "common_name"
                ? scientific_name
                : sortBy === "population_estimate"
                ? population_estimate
                : sortBy === "size_from"
                ? `${size_from} - ${size_to} cm`
                : endangerment_status}
            </h3>
          </div>
          <FavoriteButton user={user} id={id} spottedList={spottedList} />
        </Link>
      </div>

      {imageModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-gray-950 bg-opacity-50 z-40">
          <div
            className=" top-0 left-0 w-full xl:w-5/6 mx-auto h-5/6 z-50  bg-opacity-30 flex items-center justify-center relative"
            onClick={() => setImageModal((prev) => !prev)}
          >
            <div className="relative flex items-center justify-center w-screen h-screen">
              <Image
                src={src}
                alt=""
                width={800}
                height={800}
                className="max-w-full max-h-full object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
