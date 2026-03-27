"use client";

import { Add, CheckCircle, PlaylistAdd } from "@mui/icons-material";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import getAnimalLists from "@/app/actions/animallists/getAnimalLists";
import addAnimalToAnimalList from "@/app/actions/animallists/addAnimalToAnimalList";
import { createClient } from "@/utils/supabase/client";
import removeAnimalFromAnimalList from "@/app/actions/animallists/removeAnimalFromAnimalList";

export default function ListFunctionality({
  user,
  id,
  buttonStyles,
}: {
  user: User;
  id: number;
  buttonStyles?: string;
}) {
  const [lists, setLists] = useState<any[] | undefined>(undefined);
  const [showListModal, setShowListModal] = useState(false);
  const [animalListItems, setAnimalListItems] = useState<any[] | undefined>(
    undefined,
  );
  async function listItems() {
    const supabase = createClient();
    const { data: animalListItems, error: itemsError } = await supabase
      .from("animallistitems")
      .select("animal_id, list_id")
      .eq("animal_id", id)
      .eq("user_id", user.id);
    return { animalListItems, itemsError };
  }

  useEffect(() => {
    const fetchLists = async () => {
      const { lists, error } = await getAnimalLists(user.id);
      const { animalListItems, itemsError } = await listItems();
      if (error || itemsError) {
        console.error("Error fetching lists:", error || itemsError);
      } else {
        setLists(lists ?? []);
        setAnimalListItems(animalListItems ?? []);
      }
    };
    if (user && showListModal) {
      fetchLists();
    }
  }, [user, showListModal]);
  const handleListClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    isInList: boolean,
    listId: string,
  ) => {
    e.stopPropagation();
    if (isInList) {
      await removeAnimalFromAnimalList(listId, id, user.id);
    } else {
      await addAnimalToAnimalList(listId, id, user.id);
    }
    const { animalListItems: updatedItems, itemsError } = await listItems();
    if (!itemsError) {
      setAnimalListItems(updatedItems ?? []);
    } else {
      console.error("Error refetching animalListItems:", itemsError);
    }
  };
  return (
    <>
      <div className={buttonStyles}>
        <button
          className="hover:scale-110 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setShowListModal(true);
          }}
        >
          <PlaylistAdd />
        </button>
      </div>
      {showListModal && (
        <Modal
          styles={"justify-center"}
          closeModal={() => setShowListModal(false)}
        >
          <h2>Listen</h2>
          {lists &&
            lists.map((list) => {
              const isInList =
                animalListItems?.some((item) => item.list_id === list.id) ||
                false;
              return (
                <div
                  key={list.id}
                  className={`p-2 border ${isInList ? "border-green-600" : "border-gray-300"} rounded-lg w-8/12 flex items-center gap-2 cursor-pointer hover:border-green-600 transition-all duration-200 justify-between`}
                  onClick={(e) => handleListClick(e, isInList, list.id)}
                >
                  <h3 className="text-lg font-semibold">{list.title}</h3>
                  {isInList ? (
                    <CheckCircle className="text-green-600" />
                  ) : (
                    <Add />
                  )}
                </div>
              );
            })}
        </Modal>
      )}
    </>
  );
}
