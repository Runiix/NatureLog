"use client";

import { Delete } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import removeAnimalFromAnimalList from "@/app/[locale]/actions/animallists/removeAnimalFromAnimalList";
import black from "@/app/[locale]/assets/images/black.webp";
import { Link } from "@/i18n/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

export default function AnimalListItem({
  listId,
  animalId,
  name,
  image,
  user,
  spottedList,
  onRemoved,
  currUser,
}: {
  listId: string;
  animalId: number;
  name: string;
  image: string | null;
  user: User;
  spottedList: number[];
  onRemoved: () => void;
  currUser: boolean;
}) {
  const t = useTranslations("Lists");
  const toast = useToast();
  const [removing, setRemoving] = useState(false);

  const remove = async () => {
    setRemoving(true);
    const res = await removeAnimalFromAnimalList(listId, animalId);
    setRemoving(false);
    // `res` is always an object, so the old `if (res)` refreshed on failure too.
    if (res.success) onRemoved();
    else toast(t("toast.error"), "error");
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border-muted bg-surface-raised p-2 pr-3 transition-colors hover:border-border">
      <div className="relative aspect-[3/2] w-20 shrink-0 overflow-hidden rounded-md sm:w-28">
        <Image src={image ?? black} alt="" fill sizes="112px" className="object-cover" />
      </div>
      <Link
        href={`/animalpage/${name}`}
        className="min-w-0 flex-1 truncate font-medium text-fg hover:text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        {name}
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <FavoriteFunctionality user={user} id={animalId} spottedList={spottedList} name={name} />
        {currUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void remove()}
            loading={removing}
            aria-label={t("removeFromList", { name })}
            className="hover:text-danger"
          >
            {!removing && <Delete />}
          </Button>
        )}
      </div>
    </li>
  );
}
