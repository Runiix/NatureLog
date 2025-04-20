"use client";

import Image, { StaticImageData } from "next/image";
import addCollectionImage from "../../actions/addCollectionImage";
import imageCompression from "browser-image-compression";
import { use, useEffect, useRef, useState } from "react";
import { Close } from "@mui/icons-material";
import { CircleLoader } from "react-spinners";
import addSpottedDate from "@/app/actions/addSpottedDate";

type Props = {
  id: number;
  src: string | StaticImageData;
  common_name: string;
  animalImageExists: boolean;
  setEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  imageExists: boolean;
  setImageExists: React.Dispatch<React.SetStateAction<boolean>>;
  spottedAt: string;
  setSpottedAt: React.Dispatch<React.SetStateAction<string>>;
};

export default function EditFunctionality({
  id,
  src,
  common_name,
  animalImageExists,
  setEditModal,
  imageExists,
  setImageExists,
  spottedAt,
  setSpottedAt,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [firstSeen, setFirstSeen] = useState("");
  useEffect(() => {
    console.log(spottedAt);
  }, []);
  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setEditModal(false);
  }

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setSelectedFile(file);
  };
  const handleFileUpload = async (id: number) => {
    setLoading(true);
    const file = selectedFile;
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
        formData.append("common_name", common_name);
        formData.append("id", String(id));
        formData.append("date", firstSeen);

        const response = await addCollectionImage(formData);
        if (response) {
          if (imageExists === false) {
            setImageExists(true);
          }
          setEditModal(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    } else {
      const formData = new FormData();
      formData.append("date", firstSeen);
      formData.append("id", String(id));

      const response = await addSpottedDate(formData);

      if (response) {
        setSpottedAt(firstSeen);
        setEditModal(false);
        setLoading(false);
      }
    }
  };
  return (
    <div
      className={`fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
    >
      <div className="bg-gray-900 rounded-lg w-10/12 py-10 flex flex-col items-center justify-center gap-4 relative shadow-lg shadow-black">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 hover:text-slate-400"
        >
          <Close />
        </button>
        <div>
          <form className="flex flex-col gap-4">
            {" "}
            {animalImageExists && (
              <div>
                <h3>Aktuelles Bild</h3>
                <Image
                  src={src + `?t=${new Date().getTime()}`}
                  ref={imageRef}
                  alt="Placeholder"
                  width={300}
                  height={200}
                  priority
                  className="object-cover w-full h-32 sm:h-48 rounded-t-lg hover:opacity-80   transition-opacity duration-[1s] opacity-0"
                  onLoad={handleImageLoad}
                  unoptimized
                />
              </div>
            )}
            <label className="text-center group">
              <div className="bg-green-600   rounded-lg hover:bg-green-700 hover:text-gray-900 transition h-10 px-4 cursor-pointer flex items-center justify-center">
                {animalImageExists || selectedFile
                  ? "Bild ändern"
                  : "Bild hinzufügen"}
              </div>
              {selectedFile && (
                <div>
                  <h3>Neues Bild</h3>
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    ref={imageRef}
                    alt="Placeholder"
                    width={300}
                    height={200}
                    priority
                    className="object-cover w-full h-32 sm:h-48 rounded-lg hover:opacity-80   transition-opacity duration-[1s] opacity-0"
                    onLoad={handleImageLoad}
                    unoptimized
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {spottedAt !== "01. January 1970" && (
              <label>Aktuelles Datum: {spottedAt}</label>
            )}
            <input
              className="bg-gray-800 p-4 rounded-lg text-slate-200"
              type="date"
              onChange={(e) => setFirstSeen(e.target.value)}
            />
            <button
              onClick={() => handleFileUpload(id)}
              type="submit"
              disabled={loading}
              className="bg-green-600 px-4 rounded-lg hover:bg-green-700 hover:text-gray-900 transition h-12 "
            >
              {loading ? <CircleLoader size={20} /> : "Änderungen speichern"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
