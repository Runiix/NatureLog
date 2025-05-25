"use client";

import { useState } from "react";
import Modal from "./Modal";
import { User } from "@supabase/supabase-js";
import deleteUser from "@/app/actions/deleteUser";
import { useRouter } from "next/navigation";

export default function DeleteUserModal({ user }: { user: User }) {
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  const handleUserDelete = async () => {
    const res = await deleteUser();
    if (res.succes) {
      router.refresh();
      router.push("/loginpage");
      alert("Ihr Konto wurde erfolgreich gelöscht");
    } else {
      alert(
        "Fehler beim Löschen Ihres Accounts, bitte versuchen Sie es erneut oder wenden Sie sich an den Support." +
          res.error
      );
    }
  };
  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center gap-2 absolute bottom-32 md:bottom-20 right-10 md:right-20"
        aria-label="Modal zum Konto löschen öffnen"
      >
        Konto Löschen
      </button>
      {showModal && (
        <Modal closeModal={() => setShowModal((prev) => !prev)}>
          <h2>Wollen Sie Wirklich ihr Konto Löschen?</h2>
          <div className="flex flex-col w-10/12 items-center gap-4">
            <label>
              Geben Sie Ihren Benutzernamen &quot;
              <p className="text-red-600 font-bold">
                {user.user_metadata.displayName}
              </p>
              &quot; ein, wenn Sie sicher Ihr Konto löschen möchten:
            </label>
            <input
              type="text"
              onChange={handleChange}
              className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 bg-opacity-80 border border-slate-300 text-lg hover:border-slate-100 "
            />
          </div>
          <button
            disabled={input !== user.user_metadata.displayName}
            className={`${
              input === user.user_metadata.displayName
                ? "hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center gap-2"
                : " bg-red-600 opacity-50 font-bold p-4 rounded-lg text-nowrap flex items-center gap-2"
            }`}
            onClick={handleUserDelete}
            aria-label="Konto final löschen"
          >
            Konto Löschen
          </button>
        </Modal>
      )}
    </div>
  );
}
