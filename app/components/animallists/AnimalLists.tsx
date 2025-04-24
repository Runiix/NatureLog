"use client";

import React, { useEffect, useState } from "react";
import AnimalList from "./AnimalList";
import { Add, Close } from "@mui/icons-material";
import { CircleLoader } from "react-spinners";
import addAnimalList from "@/app/actions/addAnimalList";
import Modal from "../general/Modal";
import { User } from "@supabase/supabase-js";

export default function AnimalLists({
  data,
  user,
  spottedList,
  currUser,
}: {
  data: { id: string; title: string; description: string }[];
  user: User;
  spottedList: number[];
  currUser: boolean;
}) {
  const [newListModalOpen, setNewListModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setNewListModalOpen(false);
  }

  const addNewList = async () => {
    setLoading(true);
    const res = await addAnimalList({ title, description, userId: user.id });
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-20 lg:w-11/12 2xl:w-10/12 mx-auto items-center gap-4 max-w-screen">
      {data &&
        data.map((list: { id: string; title: string; description: string }) => (
          <AnimalList
            key={list.id}
            listId={list.id}
            title={list.title}
            description={list.description}
            user={user}
            spottedList={spottedList}
            currUser={currUser}
          />
        ))}
      {currUser && (
        <button
          className="size-32 rounded-lg shadow-black shadow-lg bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200 hover:text-green-600  flex items-center justify-center mx-auto my-auto"
          onClick={() => setNewListModalOpen(true)}
        >
          <Add className="text-4xl" />
        </button>
      )}
      <div>
        {newListModalOpen && (
          <Modal closeModal={() => setNewListModalOpen(false)}>
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
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibung eingeben"
                  className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-green-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
              >
                {loading ? <CircleLoader size={20} /> : "Liste hinzufügen"}
              </button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}
