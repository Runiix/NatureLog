"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AutoStories,
  Close,
  Collections,
  Home,
  Menu,
  Person,
  PowerSettingsNew,
  Settings,
  Summarize,
} from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import FollowerModal from "../social/FollowerModal";

export default function Nav({
  user,
  following,
}: {
  user: User | null;
  following?: any;
}) {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <div>
      {user ? (
        <nav className="fixed w-full h-10 sm:h-16 flex items-center bg-gray-200 z-50 shadow-sm shadow-slate-400 sm:shadow-none">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center ">
              <Link href="/homepage">
                <h2 className="text-green-600 text-2xl sm:text-4xl mx-10 hover:text-green-700 transition-all duration-200">
                  NatureLog
                </h2>
              </Link>
              <div className="hidden lg:flex gap-10">
                <Link
                  href="/homepage"
                  className="text-slate-600 hover:text-slate-800 transition-all duration-200 flex items-center gap-1"
                >
                  <Home />
                  Home
                </Link>

                <Link
                  href={"/collectionpage/" + user.user_metadata.displayName}
                  className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
                >
                  <Collections />
                  Sammlung
                </Link>
                <Link
                  href="/lexiconpage"
                  className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
                >
                  <AutoStories />
                  Lexikon
                </Link>
                <Link
                  href={"/animallistspage/" + user.user_metadata.displayName}
                  className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
                >
                  <Summarize />
                  Listen
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-6 relative">
              <div
                className="text-slate-900 cursor-pointer hover:text-green-600 mr-8 flex"
                onClick={() => setShowSignOut((prev) => !prev)}
              >
                <Person />
                <p className="hidden xl:block">
                  {user.user_metadata.displayName}
                </p>
              </div>

              <div
                className={`shadow-xl shadow-black transition-all items-center duration-500 fixed right-5 top-12 rounded-lg flex flex-col gap-10 text-center bg-gray-200 px-4 py-4 justify-center text-slate-100 ${
                  showSignOut ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              >
                <div className="space-y-4">
                  <Link
                    href={"/profilepage/" + user.user_metadata.displayName}
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
                  >
                    <Person />
                    Profil
                  </Link>
                  <Link
                    href="/settings"
                    className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
                  >
                    <Settings />
                    Einstellungen
                  </Link>
                  {following && (
                    <FollowerModal user={user} following={following} />
                  )}
                </div>

                <form
                  action="/auth/signout"
                  method="post"
                  className="hidden lg:flex"
                >
                  <button
                    type="submit"
                    className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700  text-nowrap flex items-center gap-2"
                  >
                    <PowerSettingsNew />
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
            className={`shadow-xl shadow-black transition-all duration-500 fixed right-5 top-12  text-xl w-fdivl rounded-lg flex lg:hidden flex-col gap-3 text-center bg-gray-200 border-y  px-4 pt-4  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <Link
              href="/homepage"
              className="text-slate-600 hover:text-slate-800 transition-all duration-200 w-full flex items-center gap-1"
              onClick={() => setToggleMenu(false)}
            >
              <Home />
              Home
            </Link>
            <Link
              href={"/profilepage/" + user.user_metadata.displayName}
              className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
            >
              <Person />
              Profil
            </Link>

            <Link
              href={"/collectionpage/" + user.user_metadata.displayName}
              className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
              onClick={() => setToggleMenu(false)}
            >
              <Collections />
              Sammlung
            </Link>
            <Link
              href="/lexiconpage"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
              onClick={() => setToggleMenu(false)}
            >
              <AutoStories />
              Lexikon
            </Link>
            <Link
              href={"/animallistspage/" + user.user_metadata.displayName}
              className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1 "
              onClick={() => setToggleMenu(false)}
            >
              <Summarize />
              Listen
            </Link>
            {following && <FollowerModal user={user} following={following} />}
            <form
              action="/auth/signout"
              method="post"
              className="flex lg:hidden mb-2"
            >
              <button
                type="submit"
                className="hover:text-gray-900 bg-red-600 font-bold p-4 rounded-lg  hover:bg-red-700 text-md  text-nowrap flex items-center gap-2"
              >
                <PowerSettingsNew />
                Abmelden
              </button>
            </form>
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
              className="text-slate-100 hover:text-slate-900 bg-green-600 transition-all duration-200 p-2 px-4 rounded-lg mr-10"
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
            className={`shadow-xl shadow-black transition-all items-center duration-500 fixed right-5 top-12 sm:top-20 text-xl w-fdivl rounded-lg flex lg:hidden flex-col gap-3 text-center bg-gray-200 border-y  px-4 pt-4  ${
              toggleMenu ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } `}
          >
            <Link
              href="/lexiconpage"
              className="text-slate-600 hover:text-slate-900 transition-all duration-200 flex items-center gap-1"
            >
              <AutoStories />
              Lexikon
            </Link>

            <Link
              href="/loginpage"
              className="text-slate-200 hover:text-slate-900 bg-green-600 transition-all duration-200 p-2 px-4 rounded-lg"
            >
              Anmelden
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
