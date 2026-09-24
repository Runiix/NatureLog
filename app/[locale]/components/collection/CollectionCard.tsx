"use client";

import { AddAPhoto, Edit, Flag, PhotoCamera, Visibility } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import ListFunctionality from "../general/ListFunctionality";
import ReportPhotoDialog from "../profile/ReportPhotoDialog";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import EditSightingDialog from "./EditFunctionality";

export default function CollectionCard({
  id,
  common_name,
  imageUrl,
  modalUrl,
  user,
  ownerId,
  isOwner,
  idList,
  first_spotted_at,
  animalImageExists,
}: {
  id: number;
  common_name: string;
  imageUrl: string;
  modalUrl: string;
  /** The signed-in viewer: favourites and lists are theirs. */
  user: User;
  /** Owner of the collection, i.e. who a report about this photo is about. */
  ownerId: string;
  isOwner: boolean;
  idList: number[];
  /** yyyy-mm-dd (or a full timestamp), or null. */
  first_spotted_at: string | null;
  animalImageExists: boolean;
}) {
  const t = useTranslations("Collection");
  const tProfile = useTranslations("Profile");
  const format = useFormatter();
  const [hasPhoto, setHasPhoto] = useState(animalImageExists);
  // Bumped after a new upload so the browser refetches the same object URL.
  const [version, setVersion] = useState(0);
  const [spottedAt, setSpottedAt] = useState(first_spotted_at?.slice(0, 10) ?? null);
  const [dialog, setDialog] = useState<"edit" | "photo" | "report" | null>(null);

  const bust = (url: string) =>
    version === 0 ? url : `${url}${url.includes("?") ? "&" : "?"}v=${version}`;
  const thumb = bust(imageUrl);
  const full = bust(modalUrl);

  return (
    <Card padding="none" className="group/card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-surface-sunken">
        {hasPhoto ? (
          <button
            type="button"
            onClick={() => setDialog("photo")}
            aria-label={t("openPhoto", { name: common_name })}
            className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <Image
              src={thumb}
              alt={t("photoAlt", { name: common_name })}
              fill
              unoptimized
              sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
            />
          </button>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-fg-subtle">
            <PhotoCamera aria-hidden />
            <span className="text-xs">{t("noPhoto")}</span>
          </div>
        )}

        {/* Actions sit on the photo, so the name below gets the card's full width. */}
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          <FavoriteFunctionality user={user} id={id} name={common_name} spottedList={idList} onImage />
          <ListFunctionality user={user} id={id} onImage />
          {isOwner ? (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setDialog("edit")}
              aria-label={hasPhoto ? t("editSighting") : t("addSighting")}
              className="h-8 w-8 rounded-full shadow-card"
            >
              {hasPhoto ? <Edit fontSize="small" /> : <AddAPhoto fontSize="small" />}
            </Button>
          ) : (
            hasPhoto && (
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setDialog("report")}
                aria-label={tProfile("report")}
                className="h-8 w-8 rounded-full opacity-0 shadow-card transition-opacity focus-visible:opacity-100 group-hover/card:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <Flag fontSize="small" />
              </Button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4">
        {/* Names are German; lang lets long compounds hyphenate across two lines. */}
        <Link
          href={`/animalpage/${common_name}`}
          lang="de"
          title={common_name}
          className="line-clamp-2 hyphens-auto break-words rounded font-semibold text-fg hover:text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-lg"
        >
          {common_name}
        </Link>
        {spottedAt && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted sm:text-sm">
            <Visibility aria-hidden fontSize="inherit" />
            {t("spottedOn", {
              date: format.dateTime(new Date(spottedAt), {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
            })}
          </p>
        )}
      </div>

      {dialog === "photo" && (
        <PhotoLightbox
          src={full}
          alt={t("photoAlt", { name: common_name })}
          label={common_name}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "edit" && (
        <EditSightingDialog
          animalId={id}
          name={common_name}
          currentPhoto={hasPhoto ? thumb : null}
          currentDate={spottedAt}
          onClose={() => setDialog(null)}
          onSaved={(update) => {
            if (update.photoChanged) {
              setHasPhoto(true);
              setVersion(Date.now());
            }
            if (update.date) setSpottedAt(update.date);
            setDialog(null);
          }}
        />
      )}
      {dialog === "report" && (
        <ReportPhotoDialog ownerId={ownerId} imageLink={modalUrl} onClose={() => setDialog(null)} />
      )}
    </Card>
  );
}
