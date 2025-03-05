import React from "react";

export default function UseFullaLinks() {
  return (
    <div className="py-4 sm:py-0 flex flex-col items-center justify-center text-center gap-4 text-xl">
      <h2 className="text-2xl">Nützliche Webseiten:</h2>
      <ul className="space-y-4">
        <li className="hover:text-green-600 transition-all duration-300">
          <a
            href="https://www.ornitho.de"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p>Ornitho</p>
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <a
            href="https://www.naturgucker.de"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p>Naturgucker</p>
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <a
            href="https://www.vogelmeldung.de"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p>Vogelmeldung</p>
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <a
            href="https://www.waarneming.nl"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p>Waarneming</p>
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-300">
          <a
            href="https://www.ebird.org"
            rel="noopener noreferrer"
            target="_blank"
          >
            <p>eBird</p>
          </a>{" "}
        </li>
      </ul>
    </div>
  );
}
