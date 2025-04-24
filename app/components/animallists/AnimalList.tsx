"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { CircleLoader } from "react-spinners";
import AnimalListItem from "./AnimalListItem";
import getAnimalListItems from "@/app/actions/getAnimalListItems";
import { Add, Delete, Edit } from "@mui/icons-material";
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
    const loadSearchAnimals = async () => {
      if (query) {
        const animals = await getAnimalListSearchItems(query);
        setAnimalSearchItems(animals);
      }
    };
    loadSearchAnimals();
  }, [query, searchParams]);

  useEffect(() => {
    const loadAnimals = async (offset: number) => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
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
  }, [deleteRefresh]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
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
    <div className="bg-gray-900 rounded-lg p-4 w-full sm:w-auto  max-w-96 sm:min-w-96 flex flex-col gap-4 max-h-full mx-auto max-w-screen">
      <div className="flex ">
        {" "}
        <div>
          <h2 className="text-2xl pb-2 border-b border-gray-200">
            {currTitle}
          </h2>
          <p className="text-gray-300"> {currDescription}</p>
        </div>
        <div className=" ml-auto mr-2 flex flex-col gap-2">
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

      <div className="flex flex-col overflow-y-auto max-h-64 border-x-2 border-gray-200 rounded-lg  h-full">
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
          className="mt-auto border rounded-lg w-11/12 mx-auto py-2 hover:text-green-600 hover:bg-gray-800"
        >
          <Add />
        </button>
      )}
      {addNewAnimalModalOpen && (
        <Modal closeModal={() => setAddNewAnimalModalOpen(false)}>
          <Search placeholder="Tier suchen" />
          <div className="overflow-y-auto">
            {animalSearchItems.map((animal: AnimalListItemType) => (
              <AnimalListSearchItem
                key={animal.id}
                listId={listId}
                animalId={animal.id}
                name={animal.common_name}
                image={animal.lexicon_link}
                user={user}
                spottedList={spottedList}
                inList={animalItems.some((obj) => obj.id === animal.id)}
                refresh={() => setDeleteRefresh(!deleteRefresh)}
              />
            ))}
          </div>
        </Modal>
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
