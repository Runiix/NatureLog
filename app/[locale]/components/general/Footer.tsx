import { Copyright } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <div className="p-5 bg-gray-950 flex  flex-col  gap-4  items-center sm:items-start pb-10">
      <div className="flex flex-col sm:flex-row items-center gap-4">
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
      <div>
        <p className="sm:ml-20 text-xs flex flex-col lg:flex-row text-center sm:text-start mt-5 sm:mt-0 gap-1 ml-auto">
          Diese Website ist ein freies Projekt. Wenn du möchtest, kannst du es
          freiwillig unterstützen:
          <a
            className="text-green-600 underline"
            href="https://www.paypal.me/RubenLiebert"
            target="_blank"
            rel="noopener noreferrer"
          >
            per PayPal spenden
          </a>
        </p>
      </div>
    </div>
  );
}
