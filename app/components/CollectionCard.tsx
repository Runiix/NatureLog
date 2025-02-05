"use client";

import { Add, Edit, Favorite } from "@mui/icons-material";
import Image from "next/image";
import { addOrRemoveAnimals } from "../actions/addOrRemoveAnimal";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CircleLoader } from "react-spinners";
import addCollectionImage from "../actions/addCollectionImage";

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
  spottedList: [number];
  animalImageExists: boolean;
}) {
  const [isSpotted, setIsSpotted] = useState("false");
  const link = `/animalpage/${common_name}`;
  const pathname = usePathname();
  const [src, setSrc] = useState(imageUrl);
  const [imageModal, setImageModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfSpotted = () => {
      if (spottedList !== undefined) {
        const isSpotted = spottedList.some((item) => item === id);
        if (isSpotted) setIsSpotted("true");
      }
    };
    checkIfSpotted();
  }, []);

  const handleChildElementClick = (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
  };

  const handleError = () => {
    setSrc(
      "https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
    );
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("common_name", common_name);

    const response = await addCollectionImage(formData);
    if (response) {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col w-80 bg-gray-900 rounded-lg">
        {animalImageExists ? (
          <div className="group relative flex items-end justify-end cursor-pointer">
            <Image
              src={src}
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full h-48 rounded-t-lg hover:opacity-80 "
              onError={handleError}
              onClick={() => setImageModal((prev) => !prev)}
            />
            {currUser !== "false" && (
              <label className="absolute mr-4 mb-4">
                {loading ? (
                  <CircleLoader color="#16A34A" />
                ) : (
                  <Edit className="hover:text-green-600 hover:bg-slate-200 rounded-full w-10 h-10 p-2 cursor-pointer" />
                )}
                <input
                  type="file"
                  id="photo-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="group relative flex items-center justify-center cursor-pointer">
            <Image
              src="https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/black.png"
              alt="Placeholder"
              width={300}
              height={200}
              priority
              className="object-cover w-full  rounded-t-lg hover:opacity-90 h-48"
              onError={handleError}
            />
            {currUser !== "false" && (
              <label className="absolute mr-4 mb-4">
                {loading ? (
                  <CircleLoader color="#16A34A" />
                ) : (
                  <Add className="absolute group-hover:text-green-600 group-hover:bg-slate-200 rounded-full w-10 h-10 cursor-pointer" />
                )}
                <input
                  type="file"
                  id="photo-upload"
                  onChange={handleFileUpload}
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
            <h2 className="text-2xl">{common_name}</h2>
            <h3 className="text-sm">
              {sortBy === "common_name"
                ? scientific_name
                : sortBy === "population_estimate"
                ? population_estimate
                : sortBy === "size_from"
                ? `${size_from} - ${size_to} cm`
                : endangerment_status}
            </h3>
          </div>
          {user && (
            <form
              id="spottedForm"
              onSubmit={async (e: any) => {
                e.preventDefault();
                const response = await addOrRemoveAnimals(
                  new FormData(e.target)
                );
                if (response.success) {
                  setIsSpotted(String(response.isSpotted));
                } else {
                  console.error(response.error);
                }
              }}
            >
              <input type="hidden" name="animalId" value={id} />
              <input type="hidden" name="isSpotted" value={isSpotted} />
              <input type="hidden" name="pathname" value={pathname} />

              <button
                type="submit"
                className="bg-transparent border-none text-slate-400 cursor-pointer hover:text-green-600 hover:scale-110 transition duration-300"
                onClick={(e) => handleChildElementClick(e)}
              >
                {isSpotted === "true" ? (
                  <Favorite className="text-green-600" />
                ) : (
                  <Add className="text-slate-200" />
                )}
              </button>
            </form>
          )}
        </Link>
      </div>
      {imageModal && (
        <div
          className="fixed top-0 left-0 w-full h-full z-50 bg-slate-950 bg-opacity-30 flex items-center justify-center"
          onClick={() => setImageModal((prev) => !prev)}
        >
          {" "}
          <Image
            src={src}
            alt=""
            width={1920}
            height={1920}
            className="relative m-auto z-20"
          />
        </div>
      )}
    </div>
  );
}
