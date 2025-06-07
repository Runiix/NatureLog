"use client";

import Image from "next/image";
import { MoreVert, Person } from "@mui/icons-material";
import { useState } from "react";
import changeProfilePicture from "../../actions/profile/changeProfilePicture";
import { CircleLoader } from "react-spinners";
import imageCompression from "browser-image-compression";
import addReport from "@/app/actions/general/addReport";
import Modal from "../general/Modal";

export default function ProfilePicture({
  userId,
  currUser,
  profilePic,
  profilePicUrl,
}: {
  userId: string;
  currUser: boolean;
  profilePic: boolean;
  profilePicUrl: string;
}) {
  const [profilePictureUrl, setProfilePictureUrl] = useState(profilePicUrl);
  const [loading, setLoading] = useState(false);
  const [profilePicExists, setProfilePicExists] = useState(profilePic);
  const [reportModal, setReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading(true);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("exists", profilePicExists.toString());

        const response = await changeProfilePicture(formData);
        if (response) {
          setProfilePictureUrl(
            `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${userId}/ProfilePicture/ProfilePic.jpg?t=${new Date().getTime()}`
          );
          setProfilePicExists(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };
  const handleReportText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReportText(e.target.value);
  };
  const handleAddingReport = async (imageLink: string) => {
    const res = await addReport(userId, imageLink, reportText);
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
    <div className="text-5xl flex items-center justify-center gap-2 sm:gap-4">
      {loading ? (
        <CircleLoader color="#16A34A" />
      ) : (
        <label className="group ">
          {profilePicExists === false ? (
            <Person
              className={`text-5xl border-2 rounded-full w-20 h-20 ${
                currUser && "group-hover:text-slate-400 cursor-pointer"
              }`}
            />
          ) : (
            <div className="relative ">
              <Image
                src={profilePictureUrl}
                alt="profileBanner"
                className={`z-10 object-cover rounded-full w-100 border-2 bg-gray-900 ${
                  currUser && "hover:cursor-pointer group-hover:opacity-90"
                }  h-100 aspect-square`}
                height={200}
                width={200}
                priority
                unoptimized
              />
              {!currUser && (
                <div>
                  <button
                    onClick={() => setReportModal((prev) => !prev)}
                    className="absolute hover:bg-gray-700 hover:bg-opacity-40 rounded-full group z-50 -top-4 right-0 flex items-center p-2"
                  >
                    {" "}
                    <MoreVert className=" " />
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
                            handleAddingReport(profilePictureUrl || "")
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
          )}
          <p className="hidden group-hover:flex absolute bottom-8 sm:bottom-14 ml-4 sm:ml-5 text-xs hover:cursor-pointer">
            change
          </p>
          {currUser && (
            <input
              type="file"
              id="photo-upload"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
          )}
        </label>
      )}
    </div>
  );
}
