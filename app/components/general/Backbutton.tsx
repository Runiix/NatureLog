"use client";

import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";

export default function Backbutton({ backLink }: { backLink: string }) {
  return (
    <Link
      className=" absolute left-5 top-5 hover:bg-gray-900 hover:bg-opacity-80 rounded-full p-2 hover:text-green-600"
      href={backLink}
      aria-label="navigate back to landing page"
    >
      {" "}
      <ArrowBack className="" />
    </Link>
  );
}
