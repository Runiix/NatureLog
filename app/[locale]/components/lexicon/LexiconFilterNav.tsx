"use client";

import { ChevronRight, MenuOpen } from "@mui/icons-material";
import { useState } from "react";

export default function LexiconFilterNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expandFilter, setExpandFilter] = useState(true);

  return (
    <>
      <div
        className={` shadow-black shadow-md bg-gradient-to-br from-gray-200 to-70%  to-gray-300  border transition-all duration-500 z-40 px-6 max-w-80 overflow-y-auto h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-4rem)]  sm:w-96 ${
          expandFilter
            ? "transform translate-x-0 fixed lg:relative"
            : "transform translate-x-[-100%] fixed "
        }`}
      >
        <button
          onClick={() => setExpandFilter(!expandFilter)}
          className=" top-1 right-1 text-white-400 hover:text-white focus:outline-none absolute hover:bg-gray-300 p-1 rounded-full"
        >
          <MenuOpen sx={{ color: "black", fontSize: "2rem" }} />
        </button>
        {children}
      </div>{" "}
      <button
        onClick={() => setExpandFilter(!expandFilter)}
        className={` ${expandFilter ? "transform translate-x-[20rem] opacity-0 " : "transform translate-x-0"} absolute top-1/2 left-0 text-white-400 hover:text-white focus:outline-none bg-green-600 py-10 rounded-r-lg transition-all duration-500 z-50`}
      >
        <ChevronRight sx={{ color: "white", fontSize: "2rem" }} />
      </button>
    </>
  );
}
