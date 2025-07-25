"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { CircleLoader } from "react-spinners";
import AnimalListItem from "./AnimalListItem";
import getAnimalListItems from "../../actions/animallists/getAnimalListItems";
import {
  Close,
  Delete,
  Edit,
  Public,
  PublicOff,
  ThumbUp,
} from "@mui/icons-material";
import Search from "../general/Search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import getAnimalListSearchItems from "@/app/actions/animallists/getAnimalListSearchItems";
import AnimalListSearchItem from "./AnimalListSearchItem";
import editAnimalList from "@/app/actions/animallists/editAnimalList";
import deleteAnimalList from "@/app/actions/animallists/deleteAnimalList";
import Modal from "../general/Modal";
import { User } from "@supabase/supabase-js";
import Switch from "../general/Switch";
import handleListUpvotes from "@/app/actions/animallists/handleListUpvote";
import getUpvotes from "@/app/actions/animallists/getUpvotes";
import getCount from "@/app/actions/animallists/getCount";

type AnimalListItemType = {
  id: number;
  common_name: string;
  lexicon_link: string;
};

export default function AnimalList({
  listId,
  title,
  description,
  isPublic,
  user,
  spottedList,
  currUser,
}: {
  listId: string;
  title: string;
  description: string;
  isPublic: boolean;
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
  const [currEntryCount, setCurrEntryCount] = useState(0);
  const [publicList, setPublicList] = useState(false);
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || null;
  const pathname = usePathname();
  const { replace } = useRouter();
  const [deleteRefresh, setDeleteRefresh] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    replace(`${pathname}?${params.toString()}`);
    setAnimalSearchItems([]);
    setAddNewAnimalModalOpen(false);
  }
  function listUpvoteHandler() {
    handleListUpvotes(listId, hasUpvoted);
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
    } else {
      setUpvotes((prev) => prev + 1);
    }
    setHasUpvoted((prev) => !prev);
  }
  const editList = async () => {
    setLoading(true);
    const res = await editAnimalList(
      currTitle,
      listId,
      currDescription,
      publicList
    );
    if (res.success) {
      setEditListModalOpen(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  useEffect(() => {}, [offset]);
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
  }, [title, description, deleteRefresh]);

  useEffect(() => {
    const loadUpvotes = async () => {
      const upv = await getUpvotes(listId, user.id);
      const count = await getCount(listId);
      if (upv) {
        setCurrEntryCount(count);
        setHasUpvoted(upv.hasUpvoted ?? false);
        setUpvotes(upv.upvotes);
      }
    };
    loadUpvotes();
  }, [listId]);
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
        const pageSize = 20;
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
        const pageSize = 20;
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
      <div className="flex flex-col">
        <div className=" border-b border-gray-200 flex flex-col md:flex-row">
          {" "}
          <div className="flex items-center gap-4 ">
            <h2 className=" text-xl md:text-2xl pb-2">{currTitle}</h2>
            <h2
              className={`md:text-2xl pb-2 flex items-center gap-1 cursor-pointer hover:text-green-600 ${
                hasUpvoted && "text-green-600"
              }`}
              onClick={listUpvoteHandler}
            >
              <ThumbUp />
              {upvotes}
            </h2>
          </div>
          <div className="md:ml-auto flex items-center mr-2  gap-2">
            <h2 className="md:text-2xl pb-2">{currEntryCount} Einträge</h2>

            <button
              className="hover:text-green-600 ml-auto md:ml-0"
              onClick={() => setEditListModalOpen(true)}
              aria-label="Liste bearbeiten"
            >
              <Edit />
            </button>
            <button
              className="hover:text-red-600"
              onClick={() => setDeleteListModalOpen(true)}
              aria-label="Liste löschen"
            >
              <Delete />
            </button>
            {isPublic ? (
              <Public className="text-green-600" />
            ) : (
              <PublicOff className="text-red-600" />
            )}
          </div>
        </div>

        <p className="text-gray-300"> {currDescription}</p>
      </div>

      <div className="flex flex-col overflow-y-auto max-h-[320px] sm:max-h-[550px] gap-2 py-2 pr-2  h-full">
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
              entryCount={currEntryCount}
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
          aria-label="Tier hinzufügen"
        >
          Tier hinzufügen
        </button>
      )}
      {addNewAnimalModalOpen && (
        <div
          className={`fixed w-screen h-screen top-0 left-0 bg-black/70 z-50 flex items-center justify-center`}
        >
          <div className=" bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border  h-[600px] hover:border-green-600 border-slate-200 rounded-lg w-full sm:w-10/12 lg:max-w-[50%] py-10 flex flex-col items-center justify-center gap-4 relative shadow-lg shadow-black max-h-[80%]">
            <button
              onClick={(e) => handleClose(e)}
              className="absolute top-2 right-2 hover:text-red-600"
              aria-label="Modal schließen"
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
                  spottedList={spottedList}
                  image={animal.lexicon_link}
                  user={user}
                  inList={animalItems.some((obj) => obj.id === animal.id)}
                  refresh={() => setDeleteRefresh(!deleteRefresh)}
                  entryCount={currEntryCount}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {editListModalOpen && (
        <Modal
          styles={"justify-center"}
          closeModal={() => setEditListModalOpen(false)}
        >
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
              <textarea
                value={currDescription}
                onChange={(e) => setCurrDescription(e.target.value)}
                rows={4}
                placeholder="Beschreibung eingeben"
                className="text-slate-100 w-80 py-5 pl-3 rounded-lg bg-gray-900 border bg-opacity-80 border-slate-300 text-lg hover:border-slate-100 "
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Öffentliche Liste:</label>
              <Switch
                value={isPublic}
                onChange={() => setPublicList((prev) => !prev)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-green-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
              aria-label="Liste hinzufügen"
            >
              {loading ? <CircleLoader size={20} /> : "Liste Ändern"}
            </button>
          </form>
        </Modal>
      )}
      {deleteListModalOpen && (
        <Modal
          styles={"justify-center"}
          closeModal={() => setDeleteListModalOpen(false)}
        >
          <div className="flex flex-col gap-4 items-center">
            <h2>Sind Sie sicher, dass Sie diese Liste Löschen möchten?</h2>
            <button
              disabled={loading}
              className="bg-red-600 p-4 flex justify-center items-center text-xl rounded-lg hover:bg-red-700 hover:text-gray-900 transition-all duration-200 shadow-md shadow-black"
              onClick={() => deleteList()}
              aria-label="Liste entgültig löschen"
            >
              {loading ? <CircleLoader size={20} /> : "Liste Löschen"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
