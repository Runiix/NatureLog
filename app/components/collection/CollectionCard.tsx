"use client";

import { Add, Edit, MoreVert, Visibility } from "@mui/icons-material";
import Image, { StaticImageData } from "next/image";
import { useState, useRef, useEffect } from "react";
import { CircleLoader } from "react-spinners";

import black from "@/app/assets/images/black.webp";
import { useRouter } from "next/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import EditFunctionality from "./EditFunctionality";
import { User } from "@supabase/supabase-js";
import Modal from "../general/Modal";
import addReport from "@/app/actions/general/addReport";

export default function CollectionCard({
  id,
  common_name,
  imageUrl,
  modalUrl,
  user,
  currUser,
  idList,
  first_spotted_at,
  animalImageExists,
}: {
  id: number;
  common_name: string;
  imageUrl: string | StaticImageData;
  modalUrl: string;
  user: User;
  currUser?: "false";
  idList: number[];
  first_spotted_at: string;
  animalImageExists: boolean;
}) {
  const link = `/animalpage/${common_name}`;
  const [src, setSrc] = useState<string | StaticImageData>(imageUrl);
  const [modalSrc, setModalSrc] = useState<string | StaticImageData>(modalUrl);
  const [imageModal, setImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageExists, setImageExists] = useState(animalImageExists);
  const [spottedAt, setSpottedAt] = useState<string>(first_spotted_at);
  const [editModal, setEditModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
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
    if (first_spotted_at === null) setSpottedAt("");
    else {
      const date = new Date(first_spotted_at);
      const day = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleString("ger", { month: "long" });
      const year = date.getFullYear();
      setSpottedAt(`${day}. ${month} ${year}`);
    }
  }, []);
  const handleReportText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReportText(e.target.value);
  };
  const handleAddingReport = async (imageLink: string) => {
    const res = await addReport(user.id, imageLink, reportText);
    if (res.success) {
      alert("Das Bild wurde erfolgreich gemeldet");
    } else {
      alert(
        "Beim Melden des Bildes ist etwas schief gelaufen. Versuche es erneut oder melde dich an den Support!"
      );
    }
    setReportModal(false);
  };

  return (
    <div>
      <div className="flex flex-col w-40 sm:w-80 shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 rounded-lg cursor-pointer">
        {imageExists ? (
          <div className="group relative flex items-end justify-end cursor-pointer">
            <Image
              src={src}
              ref={imageRef}
              alt="Placeholder"
              width={300}
              height={200}
              className="object-cover w-full h-24 sm:h-48 rounded-t-lg hover:opacity-80   transition-opacity duration-[1s] opacity-0"
              onLoad={handleImageLoad}
              onError={handleError}
              onClick={() => setImageModal((prev) => !prev)}
              unoptimized
            />
            {currUser !== "false" ? (
              <div>
                <div className="absolute right-1 bottom-1  sm:mr-4 sm:mb-4">
                  {loading ? (
                    <CircleLoader color="#16A34A" />
                  ) : (
                    <button
                      onClick={() => setEditModal(true)}
                      className="hover:text-green-600 bg-gray-900/70 hover:bg-gray-200 rounded-full sm:size-10 p-1 sm:p-2 cursor-pointer flex items-center justify-center"
                      aria-label="Sammlungseintrag bearbeiten"
                    >
                      <Edit />
                    </button>
                  )}
                </div>
                {editModal && (
                  <EditFunctionality
                    id={id}
                    src={src}
                    setSrc={() => setSrc(src + `?t=${new Date().getTime()}`)}
                    common_name={common_name}
                    animalImageExists={animalImageExists}
                    setEditModal={() => setEditModal(false)}
                    imageExists={imageExists}
                    setImageExists={() => setImageExists(true)}
                    spottedAt={spottedAt}
                    setSpottedAt={() => setSpottedAt(spottedAt)}
                  />
                )}
              </div>
            ) : (
              <div className="absolute top-2 right-2 p-2 hover:bg-gray-700 hover:bg-opacity-40 rounded-full group">
                <button
                  onClick={() => setReportModal(true)}
                  className="relative"
                >
                  {" "}
                  <MoreVert className="   group-hover:scale-125" />
                </button>
                {reportModal && (
                  <Modal closeModal={() => setReportModal(false)}>
                    <div className="flex flex-col items-center p-4 gap-4 mt-4">
                      <h2>Möchtest du dieses Foto melden?</h2>
                      <textarea
                        placeholder="Bitte gib einen Meldegrund an"
                        value={reportText}
                        rows={4}
                        cols={30}
                        onChange={handleReportText}
                        className="rounded-lg p-2 bg-gray-900 border border-gray-200"
                      />
                      <button
                        className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center gap-2"
                        onClick={() =>
                          handleAddingReport(
                            typeof src === "string" ? src : src.src
                          )
                        }
                      >
                        Bild melden
                      </button>
                    </div>
                  </Modal>
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
                    <button
                      onClick={() => setEditModal(true)}
                      aria-label="Sichtungsdaten hinzufügen"
                    >
                      <Add className="group-hover:text-green-600 group-hover:bg-gray-200 rounded-full w-10 h-10 cursor-pointer transition-all duration-300" />
                    </button>
                  )}
                </div>
                {editModal && (
                  <EditFunctionality
                    id={id}
                    src={src}
                    setSrc={() => setSrc(src + `?t=${new Date().getTime()}`)}
                    common_name={common_name}
                    animalImageExists={animalImageExists}
                    setEditModal={() => setEditModal(false)}
                    imageExists={imageExists}
                    setImageExists={() => setImageExists(true)}
                    spottedAt={spottedAt}
                    setSpottedAt={() => setSpottedAt(spottedAt)}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <div
          onClick={handleNavigation}
          className=" px-4 py-2 sm:p-4 w-full flex justify-between items-center cursor-pointer"
        >
          <div>
            <h2 className="text-xs sm:text-2xl">{common_name}</h2>
            {first_spotted_at && (
              <div className="flex items-center sm:gap-1 text-[0.5rem] sm:text-sm -ml-1">
                <Visibility className="scale-75 sm:scale-100" />
                <h3 className="text-[0.5rem] sm:text-sm">{spottedAt}</h3>
              </div>
            )}
          </div>
          <FavoriteFunctionality
            user={user}
            id={id}
            spottedList={idList}
            buttonStyles=""
            modalStyles=""
          />
        </div>
      </div>

      {imageModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-40">
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
