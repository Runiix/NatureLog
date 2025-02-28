import Link from "next/link";
import React from "react";

export default function UseFullLinks() {
  return (
    <div className="bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center gap-4 text-xl">
      <h2 className="text-2xl">Nützliche Webseiten:</h2>
      <ul className="space-y-4">
        <li className="hover:text-green-600 transition-all duration-300">
          <Link href="www.ornitho.de">
            <p>Ornitho</p>
          </Link>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <Link href="www.naturgucker.de">
            <p>Naturgucker</p>
          </Link>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <Link href="www.vogelmeldung.de">
            <p>Vogelmeldung</p>
          </Link>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <Link href="www.waarneming.nl">
            <p>Waarneming</p>
          </Link>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <Link href="www.ebird.org">
            <p>eBird</p>
          </Link>{" "}
        </li>
      </ul>
    </div>
  );
}
