"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import Modal from "../general/Modal";
import changePublicProfile from "@/app/actions/changePublicProfile";
import { useRouter } from "next/navigation";

export default function ChangePublicModal({
  user,
  text,
  isPublic,
}: {
  user: User;
  text: string;
  isPublic: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const handleChange = () => {
    changePublicProfile(user.id, isPublic);
    setShowModal(false);
    router.refresh();
  };
  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center gap-2   md:right-20 transition-all duration-200"
        aria-label="Modal für den Profil status Wechsel zwischen Öffentlich und Privat öffnen"
      >
        Ändern
      </button>
      {showModal && (
        <Modal closeModal={() => setShowModal((prev) => !prev)}>
          <h2>{text}</h2>
          <div className="flex flex-col w-10/12 items-center gap-4"></div>
          <button
            className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center "
            onClick={handleChange}
            aria-label="Profil status zwischen Öffentlich und Privat wechseln"
          >
            Ändern
          </button>
        </Modal>
      )}
    </div>
  );
}
