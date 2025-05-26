"use client";

import React, { useEffect, useState, useTransition } from "react";
import AnimalList from "./AnimalList";
import { Add, ExpandMore, Public, PublicOff } from "@mui/icons-material";
import { CircleLoader } from "react-spinners";
import addAnimalList from "@/app/actions/addAnimalList";
import Modal from "../general/Modal";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Switch from "../general/Switch";
import MapWithNoSSR from "./Map";
import { LatLng } from "leaflet";

export default function AnimalLists({
  data,
  user,
  spottedList,
  currUser,
}: {
  data: {
    id: string;
    title: string;
    description: string;
    is_public: boolean;
  }[];
  user: User;
  spottedList: number[];
  currUser: boolean;
}) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [newListModalOpen, setNewListModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasListLocation, setHasListLocation] = useState(false);

  const [location, setLocation] = useState<LatLng | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentAnimalList, setCurrentAnimalList] = useState<string | null>();
  const [expandListsSelect, setExpandListsSelect] = useState(false);
  const [publicList, setPublicList] = useState(false);

  const [listData, setListData] = useState<{
    id: string;
    title: string;
    description: string;
    is_public: boolean;
  } | null>();
  useEffect(() => {}, [location]);
  const handleListChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("listId", id);
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
    setExpandListsSelect(false);
  };

  useEffect(() => {
    const id = searchParams.get("listId");

    if (id) {
      const findList = data.find((item) => item.id === id);

      if (findList) {
        setCurrentAnimalList(findList.title);
        setListData(findList);
      } else {
        setCurrentAnimalList("Liste nicht gefunden");
        setListData(null);
      }
    } else {
      setCurrentAnimalList("Liste Aussuchen");
      setListData(null);
    }
  }, [searchParams, data]);

  const addNewList = async () => {
    setLoading(true);
    const res = await addAnimalList({
      title,
      description,
      userId: user.id,
      publicList,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
    });
    if (res.success) {
      setNewListModalOpen(false);
      setTitle("");
      setDescription("");
      setLoading(false);
    } else {
      console.error("Error adding new list", res.error);
      setLoading(false);
    }
  };

  return (
    <div className=" flex flex-col items-center gap-4">
      <div className="flex gap-4 items-center relative">
        <div
          className="flex items-center gap-6 shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 py-2 pl-6 pr-2 sm:text-xl rounded-lg  hover:cursor-pointer hover:from-green-600 hover:to-gray-950"
          onClick={() => setExpandListsSelect(!expandListsSelect)}
        >
          <p>{currentAnimalList}</p>
          <ExpandMore
            className={`transition-all duration-200 ${
              expandListsSelect && "rotate-180"
            }`}
          />
        </div>
        {currUser && (
          <button
            className="size-10 rounded-lg shadow-black shadow-lg bg-gradient-to-br from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:from-green-600 hover:to-gray-950 border-gray-200 border hover:border-green-600  flex items-center justify-center mx-auto my-auto"
            onClick={() => setNewListModalOpen(true)}
            aria-label="Neue Liste erstellen"
          >
            <Add className="text-4xl" />
          </button>
        )}
        <div
          className={`flex flex-col absolute top-0 left-0 rounded-lg bg-gradient-to-br  from-gray-950 to-70%   to-gray-900 hover:border-green-600  mt-12 transition-all duration-500  border border-slate-400 shadow-lg shadow-black z-50 ${
            expandListsSelect ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          {data.map((list) => (
            <div
              key={list.id}
              className=" p-3 pl-6 pr-4 gap-6 shadow-md bg-gradient-to-br from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:from-green-600 hover:to-gray-950 hover:cursor-pointer text-xl rounded-lg flex justify-between"
              onClick={() => handleListChange(list.id)}
            >
              {" "}
              <p> {list.title}</p>
              {list.is_public ? (
                <Public className="text-green-600" />
              ) : (
                <PublicOff className="text-red-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full ">
        {listData && (
          <AnimalList
            listId={listData.id}
            title={listData.title}
            description={listData.description}
            isPublic={listData.is_public}
            user={user}
            spottedList={spottedList}
            currUser={currUser}
          />
        )}

        <div>
          {newListModalOpen && (
            <Modal
              styles={"justify-center"}
              closeModal={() => setNewListModalOpen(false)}
            >
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  addNewList();
                }}
              >
                {" "}
                <h2 className="text-2xl text-center">Neue Liste erstellen</h2>
                <div className="flex flex-col gap-2">
                  <label>Titel:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titel eingeben"
                    className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Beschreibung:</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Beschreibung eingeben"
                    className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Öffentliche Liste:</label>
                  <Switch
                    value={publicList}
                    onChange={() => setPublicList((prev) => !prev)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Standort hinzufügen:</label>
                  <Switch
                    value={hasListLocation}
                    onChange={() => setHasListLocation((prev) => !prev)}
                  />
                </div>
                {hasListLocation && (
                  <MapWithNoSSR
                    onLocationSelect={setLocation}
                    height="200px"
                    iconUrl="/icons/marker-icon.png"
                    setMarker={true}
                  />
                )}{" "}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-green-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
                  aria-label="Erstellte Liste hinzufügen"
                >
                  {loading ? <CircleLoader size={20} /> : "Liste hinzufügen"}
                </button>
              </form>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}
