"use client";

import { Add, Favorite } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { addOrRemoveAnimals } from "@/app/[locale]/actions/collection/addOrRemoveAnimal";
import { cn } from "@/app/[locale]/utils/cn";
import Modal from "./Modal";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

/**
 * Collection toggle for one species: "+" adds it; the filled heart asks for
 * confirmation before removing, since that also drops the photo and date.
 *
 * Replaces FavoriteFunctionality + FavoriteButton + FavoriteModal. The spotted
 * state is derived from `spottedList` plus the user's last action, instead of
 * being copied into state by an effect.
 */
export default function FavoriteFunctionality({
  user,
  id,
  name,
  spottedList,
  buttonStyles,
  onImage = false,
}: {
  user: User | null;
  id: number;
  /** Species name, for the accessible label. */
  name?: string;
  spottedList: number[];
  buttonStyles?: string;
  /** Small raised round button for placing on top of a photo. */
  onImage?: boolean;
}) {
  const t = useTranslations("Favorite");
  const toast = useToast();
  const [override, setOverride] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!user) return null;
  const isSpotted = override ?? spottedList.includes(id);

  async function setSpotted(next: boolean) {
    setPending(true);
    const formData = new FormData();
    formData.append("animalId", String(id));
    formData.append("isSpotted", String(!next));
    let res;
    try {
      res = await addOrRemoveAnimals(formData);
    } finally {
      setPending(false);
    }
    if (res.success) {
      setOverride(res.isSpotted === "true");
      setConfirming(false);
      toast(next ? t("added") : t("removed"));
    } else {
      toast(t("error"), "error");
    }
  }

  const label = isSpotted
    ? name
      ? t("remove", { name })
      : t("removeGeneric")
    : name
      ? t("add", { name })
      : t("addGeneric");

  return (
    <>
      <Button
        variant={onImage ? "secondary" : "ghost"}
        size="icon"
        loading={pending}
        aria-label={label}
        aria-pressed={isSpotted}
        onClick={(event) => {
          // These buttons sit inside clickable cards.
          event.stopPropagation();
          if (isSpotted) setConfirming(true);
          else void setSpotted(true);
        }}
        className={cn(
          onImage ? "h-8 w-8 rounded-full shadow-card" : "h-9 w-9 rounded-full",
          isSpotted ? "text-accent-text hover:text-accent-text" : "hover:text-accent-text",
          buttonStyles,
        )}
      >
        {!pending && (isSpotted ? <Favorite /> : <Add />)}
      </Button>
      {confirming && (
        <Modal title={t("removeTitle")} closeModal={() => setConfirming(false)}>
          <p className="text-fg-muted">{t("removeText")}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button variant="danger" loading={pending} onClick={() => void setSpotted(false)}>
              {t("removeConfirm")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
