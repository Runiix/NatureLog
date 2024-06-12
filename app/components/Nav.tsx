"use client";

import Link from "next/link";
import { useState } from "react";
export default function Nav() {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <nav className="absolute w-full top-0 py-3 flex items-center gap-20 bg-gray-200 z-50">
      <div>
        <Link href="">
          <h2 className="text-green-600 text-4xl ml-10 hover:text-green-700 transition-all duration-200">
            NatureLog
          </h2>
        </Link>
      </div>
      <div className="flex gap-10 ">
        <div>
          <Link
            href="/homepage"
            className="text-slate-600 hover:text-slate-800 transition-all duration-200"
          >
            Home
          </Link>
        </div>
        <div>
          <Link
            href=""
            className="text-slate-600 hover:text-slate-900 transition-all duration-200"
          >
            Placeholder
          </Link>
        </div>
        <div>
          <Link
            href="/lexiconpage/all/all/0/1000/common_name/all
            "
            className="text-slate-600 hover:text-slate-900 transition-all duration-200"
          >
            Lexikon
          </Link>
        </div>
      </div>
    </nav>
  );
}
