"use client";

import { Add, Check } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import addAnimalToAnimalList from "@/app/[locale]/actions/animallists/addAnimalToAnimalList";
import removeAnimalFromAnimalList from "@/app/[locale]/actions/animallists/removeAnimalFromAnimalList";
import black from "@/app/[locale]/assets/images/black.webp";
import { cn } from "@/app/[locale]/utils/cn";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export default function AnimalListSearchItem({
  listId,
  animalId,
  name,
  image,
  user,
  spottedList,
  inList,
  onChanged,
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string | null;
  user: User;
  spottedList: number[];
  inList: boolean;
  onChanged: () => void;
}) {
  const t = useTranslations("Lists");
  const toast = useToast();
  const [isInList, setIsInList] = useState(inList);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    const res = isInList
      ? await removeAnimalFromAnimalList(listId, animalId)
      : await addAnimalToAnimalList(listId, animalId);
    setPending(false);
    if (res.success) {
      setIsInList(!isInList);
      onChanged();
    } else {
      toast(t("toast.error"), "error");
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-lg p-1.5 pr-2 hover:bg-surface-sunken">
      <div className="relative aspect-[3/2] w-16 shrink-0 overflow-hidden rounded-md">
        <Image src={image ?? black} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      <FavoriteFunctionality user={user} id={animalId} spottedList={spottedList} name={name} />
      <Button
        variant={isInList ? "secondary" : "primary"}
        size="icon"
        loading={pending}
        onClick={() => void toggle()}
        aria-pressed={isInList}
        aria-label={isInList ? t("removeFromList", { name }) : t("addToList", { name })}
        className={cn("h-8 w-8", isInList && "border-accent text-accent-text")}
      >
        {!pending && (isInList ? <Check fontSize="small" /> : <Add fontSize="small" />)}
      </Button>
    </li>
  );
}
