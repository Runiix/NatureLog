"use client";

import Image, { StaticImageData } from "next/image";
import addCollectionImage from "../../actions/collection/addCollectionImage";
import imageCompression from "browser-image-compression";
import { use, useEffect, useRef, useState } from "react";
import { Close } from "@mui/icons-material";
import { CircleLoader } from "react-spinners";
import addSpottedDate from "@/app/actions/collection/addSpottedDate";
import Modal from "../general/Modal";

type Props = {
  id: number;
  src: string | StaticImageData;
  setSrc: React.Dispatch<React.SetStateAction<string | StaticImageData>>;
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
  setSrc,
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
          setSrc(src + `?t=${new Date().getTime()}`);
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
    <Modal styles={"justify-center"} closeModal={() => setEditModal(false)}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFileUpload(id);
        }}
      >
        {" "}
        {animalImageExists && (
          <div>
            <h3>Aktuelles Bild</h3>
            <Image
              src={src}
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
        {spottedAt !== null && spottedAt !== "NaN. Invalid Date NaN" && (
          <label>Aktuelles Datum: {spottedAt}</label>
        )}
        <input
          className="bg-gray-800 p-4 rounded-lg text-slate-200"
          type="date"
          onChange={(e) => setFirstSeen(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-green-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
          aria-label="Änderungen für Art speichern"
        >
          {loading ? <CircleLoader size={20} /> : "Änderungen speichern"}
        </button>
      </form>
    </Modal>
  );
}
