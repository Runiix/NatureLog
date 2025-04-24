import { Close } from "@mui/icons-material";
import React from "react";

export default function Modal({
  children,
  closeModal,
}: {
  children: React.ReactNode;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className={`fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
    >
      <div className="bg-gray-900 rounded-lg w-full sm:w-10/12 sm:max-w-[50%] py-10 flex flex-col items-center justify-center gap-4 relative shadow-lg shadow-black">
        <button
          onClick={() => closeModal(false)}
          className="absolute top-2 right-2 hover:text-red-600"
        >
          <Close />
        </button>
        {children}
      </div>
    </div>
  );
}
