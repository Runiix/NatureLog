"use client";

import React, { useEffect, useState, useTransition } from "react";
import AnimalList from "./AnimalList";
import { Add, Close, ExpandMore, Public, PublicOff } from "@mui/icons-material";
import { CircleLoader } from "react-spinners";
import addAnimalList from "@/app/[locale]/actions/animallists/addAnimalList";
import Modal from "../general/Modal";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Switch from "../general/Switch";
import MapWithNoSSR from "./Map";
import { LatLng } from "leaflet";
import AnimalListCard from "./AnimalListCard";

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
  };

  useEffect(() => {
    const id = searchParams.get("listId");

    if (id) {
      const findList = data.find((item) => item.id === id);

      if (findList) {
        setListData(findList);
      } else {
        setListData(null);
      }
    } else {
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
      <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto md:mt-8 shadow-lg shadow-gray-400 p-4 rounded-lg">
        <h2 className="text-green-600 text-center text-2xl xl:text-5xl">
          Meine Listen
        </h2>{" "}
        <div className="flex items-center gap-2">
          {currUser && (
            <button
              className="p-1 md:p-3 rounded-lg shadow-black shadow-lg bg-gradient-to-br from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:from-green-600 hover:to-gray-950 border-gray-200 border hover:border-green-600  flex items-center justify-center"
              onClick={() => setNewListModalOpen(true)}
              aria-label="Neue Liste erstellen"
            >
              <h3 className={`hidden md:block`}>Liste hinzufügen</h3>
              <Add className="text-4xl" />
            </button>
          )}
          {listData && (
            <button
              className="p-1 md:p-3 rounded-lg shadow-black shadow-lg bg-gradient-to-br from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:from-green-600 hover:to-gray-950 border-gray-200 border hover:border-green-600  flex items-center justify-center"
              onClick={() => handleListChange("")}
              aria-label="Liste schließen"
            >
              <h3 className={`hidden md:block`}>Liste schließen</h3>
              <Close className="text-4xl text-red-600" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full">
        {listData ? (
          <AnimalList
            listId={listData.id}
            title={listData.title}
            description={listData.description}
            isPublic={listData.is_public}
            user={user}
            spottedList={spottedList}
            currUser={currUser}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-3/4 mx-auto">
            {data.map((list) => (
              <AnimalListCard
                key={list.id}
                list={list}
                onClick={() => handleListChange(list.id)}
              />
            ))}
          </div>
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
