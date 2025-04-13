import { Copyright } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <div className="p-5 bg-gray-950 flex gap-10 items-center">
      <p className="text-xs ml-20 flex items-center">
        <Copyright />
        Ruben Liebert 2025
      </p>
      <Link href="/impressum" className="text-xs hover:text-green-600">
        Impressum
      </Link>
      <Link href="/datasecurity" className="text-xs hover:text-green-600">
        Datenschutz
      </Link>
    </div>
  );
}
