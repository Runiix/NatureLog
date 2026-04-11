import { Launch, OpenInBrowser } from "@mui/icons-material";
import React from "react";

export default function UseFullLinks() {
  return (
    <div className="my-4 sm:py-0 flex flex-col gap-4 text-xl">
      <h2 className="text-2xl">Nützliche Webseiten</h2>
      <ul className="space-y-2">
        <li className="hover:text-green-600 transition-all duration-200 border border-slate-200 rounded-lg p-2 hover:border-green-600">
          <a
            href="https://www.ornitho.de"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 justify-between"
          >
            <p>Ornitho</p>
            <Launch />
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-200 border border-slate-200 rounded-lg p-2 hover:border-green-600">
          <a
            href="https://www.naturgucker.de"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 justify-between"
          >
            <p>Naturgucker</p>
            <Launch />
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-200 border border-slate-200 rounded-lg p-2 hover:border-green-600">
          <a
            href="https://www.vogelmeldung.de"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 justify-between"
          >
            <p>Vogelmeldung</p>
            <Launch />
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-200 border border-slate-200 rounded-lg p-2 hover:border-green-600">
          <a
            href="https://www.waarneming.nl"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 justify-between"
          >
            <p>Waarneming</p>
            <Launch />
          </a>{" "}
        </li>
        <li className="hover:text-green-600 transition-all duration-200 border border-slate-200 rounded-lg p-2 hover:border-green-600">
          <a
            href="https://www.ebird.org"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 justify-between"
          >
            <p>eBird</p>
            <Launch />
          </a>{" "}
        </li>
      </ul>
    </div>
  );
}
