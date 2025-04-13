"use client";

import { Add, Edit } from "@mui/icons-material";
import Image, { StaticImageData } from "next/image";
import { useState, useRef, useEffect } from "react";
import { CircleLoader } from "react-spinners";

import black from "@/app/assets/images/black.webp";
import { useRouter } from "next/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import EditFunctionality from "./EditFunctionality";

export default function CollectionCard({
  id,
  common_name,
  imageUrl,
  modalUrl,
  user,
  currUser,
  spottedList,
  first_spotted_at,
  animalImageExists,
}: {
  id: number;
  common_name: string;
  imageUrl: string;
  modalUrl: string;
  user: any;
  currUser?: "false";
  spottedList: number[];
  first_spotted_at: string;
  animalImageExists: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const [src, setSrc] = useState<string | StaticImageData>(imageUrl);
  const [modalSrc, setModalSrc] = useState<string | StaticImageData>(modalUrl);
  const [imageModal, setImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageExists, setImageExists] = useState(animalImageExists);
  const [spottedAt, setSpottedAt] = useState(first_spotted_at);
  const [editModal, setEditModal] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };
  const handleError = () => {
    setSrc(black);
  };

  const handleNavigation = () => {
    router.push(link);
  };

  useEffect(() => {
    const date = new Date(first_spotted_at); // convert to Date object

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();

    setSpottedAt(`${day}. ${month} ${year}`);
  }, [spottedAt]);
  return (
    <div>
      <div className="flex flex-col w-44 sm:w-80 bg-gray-900 rounded-lg shadow-md shadow-gray-800">
        {imageExists ? (
          <div className="group relative flex items-end justify-end cursor-pointer">
            <Image
              src={src + `?t=${new Date().getTime()}`}
              ref={imageRef}
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-32 sm:h-48 rounded-t-lg hover:opacity-80   transition-opacity duration-[1s] opacity-0"
              onLoad={handleImageLoad}
              onError={handleError}
              onClick={() => setImageModal((prev) => !prev)}
              unoptimized
            />
            {currUser !== "false" && (
              <div>
                <div className="absolute right-0 bottom-0  sm:mr-4 sm:mb-4">
                  {loading ? (
                    <CircleLoader color="#16A34A" />
                  ) : (
                    <button
                      onClick={() => setEditModal(true)}
                      className="hover:text-green-600 bg-gray-900/70 hover:bg-slate-200 rounded-full w-10 h-10 p-2 cursor-pointer flex items-center justify-center"
                    >
                      <Edit />
                    </button>
                  )}
                </div>
                {editModal && (
                  <EditFunctionality
                    id={id}
                    src={src}
                    common_name={common_name}
                    animalImageExists={animalImageExists}
                    setEditModal={() => setEditModal(false)}
                    imageExists={imageExists}
                    setImageExists={() => setImageExists(true)}
                    setSpottedAt={() => setSpottedAt(spottedAt)}
                  />
                )}
              </div>
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
              <div className="absolute flex items-center justify-center cursor-pointer">
                <div>
                  {loading ? (
                    <CircleLoader color="#16A34A" />
                  ) : (
                    <button onClick={() => setEditModal(true)}>
                      <Add className="group-hover:text-green-600 group-hover:bg-slate-200 rounded-full w-10 h-10 cursor-pointer" />
                    </button>
                  )}
                </div>
                {editModal && (
                  <EditFunctionality
                    id={id}
                    src={src}
                    common_name={common_name}
                    animalImageExists={animalImageExists}
                    setEditModal={() => setEditModal(false)}
                    imageExists={imageExists}
                    setImageExists={() => setImageExists(true)}
                    setSpottedAt={() => setSpottedAt(spottedAt)}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <div
          onClick={handleNavigation}
          className=" p-4 w-full flex justify-between items-center cursor-pointer"
        >
          <div>
            <h2 className="text-xs sm:text-2xl">{common_name}</h2>
            {first_spotted_at && (
              <h3 className="text-[0.5rem] sm:text-sm">
                Erstsichtung am: {spottedAt}
              </h3>
            )}
          </div>
          <FavoriteFunctionality
            user={user}
            id={id}
            spottedList={spottedList}
            buttonStyles=""
            modalStyles=""
          />
        </div>
      </div>

      {imageModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-gray-950 bg-opacity-50 z-40">
          <div
            className=" top-0 left-0 w-full xl:w-5/6 mx-auto h-5/6 z-50  bg-opacity-30 flex items-center justify-center relative"
            onClick={() => setImageModal((prev) => !prev)}
          >
            <div className="relative flex items-center justify-center w-screen h-screen">
              <Image
                src={modalSrc}
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
