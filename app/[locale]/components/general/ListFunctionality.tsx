"use client";

import { Add, Check, PlaylistAdd } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import addAnimalToAnimalList from "@/app/[locale]/actions/animallists/addAnimalToAnimalList";
import getAnimalLists, { type ListMembership } from "@/app/[locale]/actions/animallists/getAnimalLists";
import removeAnimalFromAnimalList from "@/app/[locale]/actions/animallists/removeAnimalFromAnimalList";
import { cn } from "@/app/[locale]/utils/cn";
import Modal from "./Modal";
import { Button, ButtonLink } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

/** "Add this animal to one of my lists" button and picker. */
export default function ListFunctionality({
  user,
  id,
  buttonStyles,
}: {
  user: User;
  id: number;
  buttonStyles?: string;
}) {
  const t = useTranslations("ListPicker");
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ListMembership[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function openPicker(event: React.MouseEvent) {
    event.stopPropagation();
    setOpen(true);
    setLists(null);
    setLists(await getAnimalLists(id));
  }

  async function toggle(list: ListMembership) {
    setPending(list.id);
    const res = list.containsAnimal
      ? await removeAnimalFromAnimalList(list.id, id)
      : await addAnimalToAnimalList(list.id, id);
    setPending(null);
    if (!res.success) {
      toast(t("error"), "error");
      return;
    }
    setLists((current) =>
      current?.map((item) =>
        item.id === list.id ? { ...item, containsAnimal: !item.containsAnimal } : item,
      ) ?? null,
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(event) => void openPicker(event)}
        aria-label={t("open")}
        className={cn("h-9 w-9 rounded-full", buttonStyles)}
      >
        <PlaylistAdd />
      </Button>
      {open && (
        <Modal title={t("title")} closeModal={() => setOpen(false)}>
          {lists === null ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-fg-muted">{t("empty")}</p>
              <ButtonLink
                href={`/animallistspage/${user.user_metadata.displayName}`}
                variant="secondary"
              >
                {t("createList")}
              </ButtonLink>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    type="button"
                    onClick={() => void toggle(list)}
                    disabled={pending !== null}
                    aria-pressed={list.containsAnimal}
                    aria-label={
                      list.containsAnimal
                        ? t("inList", { title: list.title ?? "" })
                        : t("notInList", { title: list.title ?? "" })
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60",
                      list.containsAnimal
                        ? "border-accent bg-accent/10 text-accent-text"
                        : "border-border-muted hover:border-accent",
                    )}
                  >
                    <span className="truncate">{list.title}</span>
                    <span aria-hidden className="flex shrink-0">
                      {list.containsAnimal ? <Check /> : <Add />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
