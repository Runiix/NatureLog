import { Copyright } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <div className="p-5 bg-gray-950 flex flex-col sm:flex-row gap-4 sm:gap-10 items-center">
      <p className="text-xs sm:ml-20 flex items-center">
        <Copyright />
        Ruben Liebert 2025
      </p>
      <Link href="/impressum" className="text-xs hover:text-green-600">
        Impressum & Datenschutz
      </Link>
      <Link href="/contactpage" className="text-xs hover:text-green-600">
        Kontakt
      </Link>
    </div>
  );
}
