"use client";

import Link from "next/link";
import { useState } from "react";
import { Close, Menu, Person } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";

export default function Nav({ user }: { user: User | null }) {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div>
      {user ? (
        <nav className="fixed w-full py-3 flex items-center bg-gray-200 z-50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center ">
              <div>
                <Link href="/homepage">
                  <h2 className="text-green-600 text-2xl sm:text-4xl mx-10 hover:text-green-700 transition-all duration-200">
                    NatureLog
                  </h2>
                </Link>
              </div>
              <div className="hidden lg:flex gap-10">
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
                    href={"/profilepage/" + user.user_metadata.displayName}
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Profil
                  </Link>
                </div>
                <div>
                  <Link
                    href={"/collectionpage/" + user.user_metadata.displayName}
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Sammlung
                  </Link>
                </div>
                <div>
                  <Link
                    href="/lexiconpage"
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Lexikon
                  </Link>
                </div>
                <div>
                  <Link
                    href="/socialpage"
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    Community
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-slate-900">
                <Person />
                {user.user_metadata.displayName}
              </div>
              <div>
                <form
                  action="/auth/signout"
                  method="post"
                  className="hidden lg:flex"
                >
                  <button
                    type="submit"
                    className="text-zinc-900 bg-green-600 font-bold my-2 py-2 px-4 mr-8 rounded hover:bg-green-700 hover:text-slate-100 text-nowrap"
                  >
                    Abmelden
                  </button>
                </form>
              </div>
            </div>
            <div className="m-2 flex lg:invisible absolute right-5 hover:cursor-pointer">
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
            className={`shadow-xl shadow-black transition-all items-center duration-500 fixed right-5 top-12 sm:top-20 text-xl w-fdivl rounded-md flex lg:hidden flex-col gap-3 text-center bg-slate-200 border-y  px-4 pt-4  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <Link
              href="/homepage"
              className="text-slate-600 hover:text-slate-800 transition-all duration-200 w-full"
              onClick={() => setToggleMenu(false)}
            >
              Home
            </Link>
            <Link
              href={"/profilepage/" + user.user_metadata.displayName}
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
              onClick={() => setToggleMenu(false)}
            >
              Profil
            </Link>

            <Link
              href={"/collectionpage/" + user.user_metadata.displayName}
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
              onClick={() => setToggleMenu(false)}
            >
              Sammlung
            </Link>
            <Link
              href="/lexiconpage"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
              onClick={() => setToggleMenu(false)}
            >
              Lexikon
            </Link>
            <Link
              href="/socialpage"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
              onClick={() => setToggleMenu(false)}
            >
              Community
            </Link>

            <div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-zinc-900 bg-green-600 font-bold my-2 py-2 px-4 rounded hover:bg-green-700 hover:text-slate-100"
                >
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="absolute w-screen top-0 py-3 flex items-center justify-between bg-gray-200 z-50">
          <div className="flex items-center gap-20">
            <div>
              <Link href="/">
                <h2 className="text-green-600 text-2xl sm:text-4xl ml-10 hover:text-green-700 transition-all duration-200">
                  NatureLog
                </h2>
              </Link>
            </div>
            <div className="hidden sm:flex gap-10 ">
              <Link
                href="/lexiconpage"
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
          <div
            className="m-2 flex sm:invisible absolute right-5 hover:cursor-pointer text-gray-900"
            onClick={() => setToggleMenu(!toggleMenu)}
          >
            {toggleMenu ? <Close /> : <Menu />}
          </div>
          <div
            className={`shadow-xl shadow-black transition-all items-center duration-500 fixed right-5 top-12 sm:top-20 text-xl w-fdivl rounded-md flex lg:hidden flex-col gap-3 text-center bg-slate-200 border-y  px-4 pt-4  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <Link
              href="/lexiconpage"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200"
            >
              Lexikon
            </Link>

            <Link
              href="/loginpage"
              className="text-slate-200 hover:text-slate-900 bg-green-600 transition-all duration-200 p-2 px-4 rounded-md"
            >
              Anmelden
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
