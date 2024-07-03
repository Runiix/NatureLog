"use client";

import Link from "next/link";
import { useState } from "react";
import { Close, Menu } from "@mui/icons-material";

export default function Nav(user: any) {
  const [toggleMenu, setToggleMenu] = useState(false);
  console.log("User", user);
  return (
    <div>
      {!user || user === null ? (
        <nav className="absolute w-full top-0 py-3 flex items-center justify-between bg-gray-200 z-50">
          <div className="flex items-center gap-20">
            <div>
              <Link href="/">
                <h2 className="text-green-600 text-4xl ml-10 hover:text-green-700 transition-all duration-200">
                  NatureLog
                </h2>
              </Link>
            </div>
            <div className="hidden sm:flex gap-10 ">
              <Link
                href="/lexiconpage/all/all/0/1000/common_name/true"
                className="text-slate-600 hover:text-slate-900 transition-all duration-200"
              >
                Lexikon
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex">
            <Link
              href="/loginpage"
              className="text-slate-100 hover:text-slate-900 bg-green-600 transition-all duration-200 p-2 px-4 rounded-md mr-10"
            >
              Anmelden
            </Link>
          </div>
          <div className="m-2 flex sm:invisible absolute right-5 top-5 hover:cursor-pointer">
            {toggleMenu ? <Close /> : <Menu />}
          </div>
          <div
            className={`shadow-xl shadow-black transition-all items-center duration-500 fixed left-0 top-20 text-xl w-fdivl rounded-lg flex flex-col gap-3 text-center bg-gray-900 border-y border-slate-400  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <div className="">
              <div>
                <Link href="/">
                  <h2 className="text-green-600 text-4xl ml-10 hover:text-green-700 transition-all duration-200">
                    NatureLog
                  </h2>
                </Link>
              </div>
              <div className="flex gap-10 ">
                <div>
                  <Link
                    href="/lexiconpage/all/all/0/1000/common_name/true"
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Lexikon
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <Link
                href="/loginpage"
                className="text-slate-100 hover:text-slate-900 bg-green-600 transition-all duration-200 p-2 px-4 rounded-md mr-10"
              >
                Anmelden
              </Link>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="absolutetop-0 py-3 flex items-center bg-gray-200 z-50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center ">
              <div>
                <Link href="/">
                  <h2 className="text-green-600 text-4xl mx-10 hover:text-green-700 transition-all duration-200">
                    NatureLog
                  </h2>
                </Link>
              </div>
              <div className="hidden md:flex gap-10">
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
                    href="/lexiconpage/all/all/0/1000/common_name/true"
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Lexikon
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <div>
                <form
                  action="/auth/signout"
                  method="post"
                  className="hidden md:flex"
                >
                  <button
                    type="submit"
                    className="text-zinc-900 bg-green-600 font-bold my-2 py-2 px-4 mr-8 rounded hover:bg-green-700 hover:text-slate-100 text-nowrap"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
            <div className="m-2 flex md:invisible absolute right-5 top-5 hover:cursor-pointer">
              {toggleMenu ? (
                <Close
                  className="text-gray-900"
                  onClick={() => setToggleMenu(false)}
                />
              ) : (
                <Menu
                  className="text-gray-900"
                  onClick={() => setToggleMenu(true)}
                />
              )}
            </div>
          </div>

          <div
            className={`shadow-xl shadow-black transition-all items-center duration-500 fixed right-5 top-20 text-xl w-fdivl rounded-md flex md:hidden flex-col gap-3 text-center bg-slate-200 border-y  px-4 pt-4  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <Link
              href="/homepage"
              className="text-slate-600 hover:text-slate-800 transition-all duration-200 w-full"
            >
              Home
            </Link>
            <Link
              href=""
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
            >
              Placeholder
            </Link>
            <Link
              href="/lexiconpage/all/all/0/1000/common_name/true"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
            >
              Lexikon
            </Link>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-zinc-900 bg-green-600 font-bold my-2 py-2 px-4 rounded hover:bg-green-700 hover:text-slate-100"
              >
                Sign Out
              </button>
            </form>
          </div>
        </nav>
      )}
    </div>
  );
}
