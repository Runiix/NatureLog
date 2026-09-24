"use client";

import { Edit, Instagram } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import changeFavoriteAnimal from "@/app/[locale]/actions/profile/changeFavoriteAnimal";
import changeInstaLink from "@/app/[locale]/actions/profile/changeInstaLink";
import changeTeam from "@/app/[locale]/actions/profile/changeTeam";
import { cn } from "@/app/[locale]/utils/cn";
import {
  MAX_FAVORITE_ANIMAL,
  TEAMS,
  teamFromUrl,
  teamImageUrl,
  type Team,
} from "@/app/[locale]/utils/profileFields";
import type { ActionResult } from "@/app/[locale]/utils/result";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Field";
import { useToast } from "../ui/Toast";
import { StatTile } from "./StatTile";

/**
 * Name, Instagram link and the stat row. The owner edits favourite animal,
 * Instagram and team through themed dialogs (two of these were hand-rolled
 * overlays before, and the UI updated even when the save failed).
 */
export default function ProfileInfos({
  displayName,
  vertebrateCount,
  invertebrateCount,
  listsCount,
  teamIcon,
  favoriteAnimal,
  currUser,
  instaLink,
}: {
  displayName: string;
  vertebrateCount: number;
  invertebrateCount: number;
  listsCount: number;
  teamIcon: string | null;
  favoriteAnimal: string | null;
  currUser: boolean;
  instaLink: string | null;
}) {
  const t = useTranslations("Profile");
  const toast = useToast();
  const [team, setTeam] = useState<Team | null>(teamFromUrl(teamIcon));
  const [favorite, setFavorite] = useState(favoriteAnimal);
  const [insta, setInsta] = useState(instaLink);
  const [dialog, setDialog] = useState<"favorite" | "insta" | "team" | null>(null);
  const [teamSaving, setTeamSaving] = useState<Team | null>(null);

  async function pickTeam(next: Team) {
    setTeamSaving(next);
    const res = await changeTeam(next);
    setTeamSaving(null);
    if (res.success) {
      setTeam(next);
      setDialog(null);
      toast(t("toast.saved"));
    } else {
      toast(t("toast.error"), "error");
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h1>
        {insta && (
          <a
            href={insta}
            rel="noopener noreferrer nofollow"
            target="_blank"
            aria-label={t("instagramOf", { name: displayName })}
            className="rounded-full p-1 text-fg-muted transition-colors hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Instagram />
          </a>
        )}
        {currUser && (
          <Button
            variant="ghost"
            size="sm"
            icon={insta ? <Edit fontSize="small" /> : <Instagram fontSize="small" />}
            onClick={() => setDialog("insta")}
            aria-label={insta ? t("editInstagram") : undefined}
            className="-ml-1"
          >
            {insta ? null : t("addInstagram")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label={t("stats.vertebrates")}
          value={vertebrateCount}
          detail={invertebrateCount > 0 ? t("stats.invertebrates", { count: invertebrateCount }) : undefined}
          href={`/collectionpage/${displayName}`}
        />
        <StatTile
          label={t("stats.lists")}
          value={listsCount}
          href={`/animallistspage/${displayName}`}
        />
        <StatTile
          label={t("stats.team")}
          value={
            team ? (
              <span className="flex items-center gap-2">
                <Image
                  src={teamImageUrl(team)}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                {t(`teams.${team}`)}
              </span>
            ) : currUser ? (
              t("chooseTeam")
            ) : (
              t("noTeam")
            )
          }
          onClick={currUser ? () => setDialog("team") : undefined}
          actionLabel={t("chooseTeamTitle")}
        />
        <StatTile
          label={t("stats.favorite")}
          value={favorite || t("noFavorite")}
          onClick={currUser ? () => setDialog("favorite") : undefined}
          actionLabel={t("editFavorite")}
        />
      </div>

      {currUser && dialog === "team" && (
        <Modal title={t("chooseTeamTitle")} closeModal={() => setDialog(null)}>
          <div role="radiogroup" aria-label={t("chooseTeamTitle")} className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {TEAMS.map((option) => {
              const selected = option === team;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={teamSaving !== null}
                  onClick={() => void pickTeam(option)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60",
                    selected
                      ? "border-accent bg-accent/10 text-accent-text"
                      : "border-border-muted hover:border-accent",
                  )}
                >
                  <Image
                    src={teamImageUrl(option)}
                    alt=""
                    width={64}
                    height={64}
                    className={cn("rounded-lg", teamSaving === option && "animate-pulse")}
                  />
                  {t(`teams.${option}`)}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {currUser && dialog === "favorite" && (
        <EditFieldDialog
          title={t("editFavorite")}
          label={t("favoriteLabel")}
          name="favorite_animal"
          defaultValue={favorite ?? ""}
          placeholder={t("favoritePlaceholder")}
          maxLength={MAX_FAVORITE_ANIMAL}
          required
          action={changeFavoriteAnimal}
          errorMessage={t("toast.error")}
          onSaved={(value) => {
            setFavorite(value);
            setDialog(null);
            toast(t("toast.saved"));
          }}
          onClose={() => setDialog(null)}
        />
      )}

      {currUser && dialog === "insta" && (
        <EditFieldDialog
          title={t("editInstagram")}
          label={t("instagramLabel")}
          hint={t("instagramHint")}
          name="link"
          defaultValue={insta ?? ""}
          placeholder="@naturelog"
          maxLength={200}
          action={changeInstaLink}
          errorMessage={t("toast.invalidInstagram")}
          onSaved={(value) => {
            setInsta(value);
            setDialog(null);
            toast(t("toast.saved"));
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

/** One-field edit dialog; the UI only updates once the server accepted it. */
function EditFieldDialog<T>({
  title,
  label,
  hint,
  name,
  defaultValue,
  placeholder,
  maxLength,
  required,
  action,
  errorMessage,
  onSaved,
  onClose,
}: {
  title: string;
  label: string;
  hint?: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  maxLength: number;
  required?: boolean;
  action: (formData: FormData) => Promise<ActionResult<T>>;
  errorMessage: string;
  onSaved: (value: T) => void;
  onClose: () => void;
}) {
  const t = useTranslations("Profile");
  const [value, setValue] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append(name, value);
    const res = await action(formData);
    setSaving(false);
    if (res.success) onSaved(res.data);
    else setError(errorMessage);
  }

  return (
    <Modal title={title} closeModal={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label={label} hint={hint} error={error ?? undefined} required={required}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoFocus
          />
        </Field>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button type="submit" loading={saving} disabled={required && value.trim() === ""}>
            {t("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
