"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { CircleLoader } from "react-spinners";
import AnimalListItem from "./AnimalListItem";
import getAnimalListItems from "../../actions/getAnimalListItems";
import { Close, Delete, Edit } from "@mui/icons-material";
import Search from "../general/Search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import getAnimalListSearchItems from "@/app/actions/getAnimalListSearchItems";
import AnimalListSearchItem from "./AnimalListSearchItem";
import editAnimalList from "@/app/actions/editAnimalList";
import deleteAnimalList from "@/app/actions/deleteAnimalList";
import Modal from "../general/Modal";
import { User } from "@supabase/supabase-js";

type AnimalListItemType = {
  id: number;

  common_name: string;
  lexicon_link: string;
};

export default function AnimalList({
  listId,
  title,
  description,
  user,
  spottedList,
  currUser,
}: {
  listId: string;
  title: string;
  description: string;
  user: User;
  spottedList: number[];
  currUser: boolean;
}) {
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(true);
  const [animalItems, setAnimalItems] = useState<AnimalListItemType[]>([]);
  const [animalSearchItems, setAnimalSearchItems] = useState<
    AnimalListItemType[]
  >([]);
  const [offset, setOffset] = useState(0);
  const [addNewAnimalModalOpen, setAddNewAnimalModalOpen] = useState(false);
  const [editListModalOpen, setEditListModalOpen] = useState(false);
  const [deleteListModalOpen, setDeleteListModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currTitle, setCurrTitle] = useState(title);
  const [currDescription, setCurrDescription] = useState(description);
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || null;
  const pathname = usePathname();
  const { replace } = useRouter();
  const [deleteRefresh, setDeleteRefresh] = useState(false);

  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    replace(`${pathname}?${params.toString()}`);
    setAnimalSearchItems([]);
    setAddNewAnimalModalOpen(false);
  }
  const editList = async () => {
    setLoading(true);
    const res = await editAnimalList(currTitle, listId, currDescription);
    if (res.success) {
      setEditListModalOpen(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  const deleteList = async () => {
    setLoading(true);
    const res = await deleteAnimalList(listId);
    if (res.success) {
      setDeleteListModalOpen(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCurrTitle(title);
    setCurrDescription(description);
  }, [title, description]);

  useEffect(() => {
    const loadSearchAnimals = async () => {
      const animals = await getAnimalListSearchItems(query);
      setAnimalSearchItems(animals);
    };
    loadSearchAnimals();
  }, [query, searchParams, title, description, listId]);

  useEffect(() => {
    const loadAnimals = async (offset: number) => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 10;
        } else {
          pageSize = 8;
        }
        const data = await getAnimalListItems(listId, offset, pageSize);
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        } else {
          setLoadingMoreAnimals(true);
        }

        setAnimalItems(data);
        setOffset(1);
      } catch (error) {
        console.error("Error loading animals:", error);
      }
    };
    loadAnimals(0);
  }, [deleteRefresh, title, description, listId]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 10;
        } else {
          pageSize = 8;
        }
        const data = await getAnimalListItems(listId, offset, pageSize);
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimalItems((prevAnimals: AnimalListItemType[]) => [
          ...prevAnimals,
          ...data,
        ]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView && animalItems.length > 0) {
      loadMoreAnimals();
    }
  }, [inView]);
  return (
    <div className="p-4 w-full sm:w-11/12 md:w-10/12 xl:w-1/2 lg:max-w-[1/2] flex-col gap-4  mx-auto rounded-lg shadow-black shadow-lg flex justify-center bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200">
      <div className="flex">
        {" "}
        <div className="w-full">
          <div className=" border-b border-gray-200 flex">
            {" "}
            <h2 className="text-2xl pb-2">{currTitle}</h2>
            <div className=" ml-auto mr-2 flex gap-2">
              <button
                className="hover:text-green-600"
                onClick={() => setEditListModalOpen(true)}
              >
                <Edit />
              </button>
              <button
                className="hover:text-red-600"
                onClick={() => setDeleteListModalOpen(true)}
              >
                <Delete />
              </button>
            </div>
          </div>

          <p className="text-gray-300"> {currDescription}</p>
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto  gap-2 py-2 pr-2  h-full">
        {animalItems.map(
          (animal: {
            id: number;
            common_name: string;
            lexicon_link: string;
          }) => (
            <AnimalListItem
              key={animal.id}
              listId={listId}
              animalId={animal.id}
              name={animal.common_name}
              image={animal.lexicon_link}
              user={user}
              spottedList={spottedList}
              deleteRefresh={() => setDeleteRefresh(!deleteRefresh)}
              currUser={currUser}
            />
          )
        )}
        <div>
          {loadingMoreAnimals && (
            <div className=" m-10" ref={ref}>
              {" "}
              <CircleLoader color="#16A34A" />{" "}
            </div>
          )}
        </div>
      </div>
      {currUser && (
        <button
          onClick={() => setAddNewAnimalModalOpen(true)}
          className="mt-auto rounded-lg w-11/12 mx-auto py-2 transition-all duration-200 bg-green-600 hover:bg-green-700 hover:text-gray-900"
        >
          Tier hinzufügen
        </button>
      )}
      {addNewAnimalModalOpen && (
        <div
          className={`fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
        >
          <div className=" bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200 rounded-lg w-full sm:w-10/12 lg:max-w-[50%] py-10 flex flex-col items-center justify-center gap-4 relative shadow-lg shadow-black max-h-[80%]">
            <button
              onClick={(e) => handleClose(e)}
              className="absolute top-2 right-2 hover:text-red-600"
            >
              <Close />
            </button>
            <h2 className="sm:text-2xl text-center px-2 sm:px-6">
              Geben Sie einen Tiernamen ein und fügen Sie es zu Ihrer Liste
              hinzu.
            </h2>
            <Search placeholder="Tier suchen" />
            <div className="overflow-y-auto px-2 space-y-2 ">
              {animalSearchItems.map((animal: AnimalListItemType) => (
                <AnimalListSearchItem
                  key={animal.id}
                  listId={listId}
                  animalId={animal.id}
                  name={animal.common_name}
                  image={animal.lexicon_link}
                  user={user}
                  inList={animalItems.some((obj) => obj.id === animal.id)}
                  refresh={() => setDeleteRefresh(!deleteRefresh)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {editListModalOpen && (
        <Modal closeModal={() => setEditListModalOpen(false)}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              editList();
            }}
          >
            {" "}
            <h2 className="text-2xl text-center">Neue Liste erstellen</h2>
            <div className="flex flex-col gap-2">
              <label>Titel:</label>
              <input
                type="text"
                value={currTitle}
                onChange={(e) => setCurrTitle(e.target.value)}
                placeholder="Titel eingeben"
                className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Beschreibung:</label>
              <input
                type="text"
                value={currDescription}
                onChange={(e) => setCurrDescription(e.target.value)}
                placeholder="Beschreibung eingeben"
                className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-green-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
            >
              {loading ? <CircleLoader size={20} /> : "Liste Ändern"}
            </button>
          </form>
        </Modal>
      )}
      {deleteListModalOpen && (
        <Modal closeModal={() => setDeleteListModalOpen(false)}>
          <div className="flex flex-col gap-4 items-center">
            <h2>Sind Sie sicher, dass Sie diese Liste Löschen möchten?</h2>
            <button
              disabled={loading}
              className="bg-red-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-red-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
              onClick={() => deleteList()}
            >
              {loading ? <CircleLoader size={20} /> : "Liste Löschen"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
