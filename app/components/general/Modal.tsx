import { Close } from "@mui/icons-material";
import React from "react";

export default function Modal({
  children,
  closeModal,
}: {
  children: React.ReactNode;
  closeModal: any;
}) {
  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    closeModal(false);
  }
  return (
    <div
      className={`fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
    >
      <div className="bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200 rounded-lg w-full sm:w-10/12 sm:max-w-[50%] py-10 flex flex-col items-center justify-center gap-4 relative shadow-lg shadow-black">
        <button
          onClick={(e) => handleClose(e)}
          className="absolute top-2 right-2 hover:text-red-600"
        >
          <Close />
        </button>
        {children}
      </div>
    </div>
  );
}
