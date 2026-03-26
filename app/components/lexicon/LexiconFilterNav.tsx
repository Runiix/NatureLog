"use client";

import { MenuOpen } from "@mui/icons-material";
import { useState } from "react";

export default function LexiconFilterNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expandFilter, setExpandFilter] = useState(true);
  if (!expandFilter) {
    return (
      <button
        onClick={() => setExpandFilter(!expandFilter)}
        className=" top-2 right-2 text-white-400 hover:text-white focus:outline-none"
      >
        <MenuOpen sx={{ color: "black", fontSize: "2rem" }} />
      </button>
    );
  }

  return (
    <div
      className={` shadow-black shadow-md bg-gradient-to-br from-gray-200 to-70%  to-gray-300  border transition-all duration-500 z-40 px-6 max-w-80 ${
        expandFilter
          ? "transform translate-x-0 scale-100 opacity-100 relative"
          : "transform translate-x-[-100%] scale-95 opacity-0 fixed"
      }`}
    >
      <button
        onClick={() => setExpandFilter(!expandFilter)}
        className=" top-1 right-1 text-white-400 hover:text-white focus:outline-none absolute hover:bg-gray-300 p-1 rounded-full"
      >
        <MenuOpen sx={{ color: "black", fontSize: "2rem" }} />
      </button>
      {children}
    </div>
  );
}
