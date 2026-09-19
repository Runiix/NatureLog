"use client";

import { AddAPhoto, Delete, Edit, Flag, PhotoLibrary } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import addProfileGridImage from "../../actions/profile/addProfileGridImage";
import changeProfileGridImage from "../../actions/profile/changeProfileGridImage";
import getProfileGrid from "../../actions/profile/getProfileGrid";
import removeProfileGridImage from "../../actions/profile/removeProfileGridImage";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import ReportPhotoDialog from "./ReportPhotoDialog";

export const MAX_GRID_IMAGES = 12;

export type ProfileGridImage = {
  name: string;
  gridUrl: string | null;
  modalUrl: string | null;
};

const THUMB = { maxSizeMB: 0.02, maxWidthOrHeight: 500, useWebWorker: true };
const FULL = { maxSizeMB: 0.2, maxWidthOrHeight: 1920, useWebWorker: true };

async function compressPair(file: File) {
  const [thumb, full] = await Promise.all([
    imageCompression(file, THUMB),
    imageCompression(file, FULL),
  ]);
  const formData = new FormData();
  formData.append("file", thumb);
  formData.append("modalFile", full);
  return formData;
}

/**
 * Up to twelve favourite photos. The first render comes from the server
 * (`initialImages`), so there is no client-side fetch before anything shows;
 * the action is only called again to refresh after a change.
 */
export default function PictureGrid({
  userId,
  displayName,
  currUser,
  initialImages,
}: {
  /** Owner of the grid: whose images are listed and who a report is about. */
  userId: string;
  displayName: string;
  currUser: boolean;
  initialImages: ProfileGridImage[];
}) {
  const t = useTranslations("Profile");
  const toast = useToast();
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState<string | "new" | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [reporting, setReporting] = useState<ProfileGridImage | null>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);

  const full = images.length >= MAX_GRID_IMAGES;

  async function refresh() {
    setImages(await getProfileGrid(userId));
  }

  async function add(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy("new");
    try {
      const res = await addProfileGridImage(await compressPair(file));
      if (res.success) {
        await refresh();
        toast(t("toast.uploaded"));
      } else {
        toast(
          res.profileGridFull ? t("toast.gridFull", { max: MAX_GRID_IMAGES }) : t("toast.error"),
          "error",
        );
      }
    } catch (error) {
      console.error("Grid upload failed:", error);
      toast(t("toast.error"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function replace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const oldName = replaceTarget.current;
    event.target.value = "";
    if (!file || !oldName) return;
    setBusy(oldName);
    try {
      const formData = await compressPair(file);
      formData.append("old_name", oldName);
      const res = await changeProfileGridImage(formData);
      if (res.success) {
        await refresh();
        toast(t("toast.replaced"));
      } else {
        toast(t("toast.error"), "error");
      }
    } catch (error) {
      console.error("Grid replace failed:", error);
      toast(t("toast.error"), "error");
    } finally {
      setBusy(null);
    }
  }

  async function remove(name: string) {
    setBusy(name);
    const formData = new FormData();
    formData.append("name", name);
    const res = await removeProfileGridImage(formData);
    if (res.success) {
      setImages((current) => current.filter((image) => image.name !== name));
      toast(t("toast.deleted"));
    } else {
      toast(t("toast.error"), "error");
    }
    setBusy(null);
  }

  const open = lightbox === null ? null : images[lightbox];

  return (
    <section aria-labelledby="profile-photos" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="profile-photos" className="text-xl font-semibold tracking-tight">
          {t("photos")}
        </h2>
        {currUser && (
          <span className="text-sm tabular-nums text-fg-subtle">
            {t("photosCount", { count: images.length, max: MAX_GRID_IMAGES })}
          </span>
        )}
      </div>

      {images.length === 0 && !currUser ? (
        <EmptyState icon={<PhotoLibrary />} title={t("noPhotosVisitorTitle")} />
      ) : images.length === 0 && busy !== "new" ? (
        <EmptyState
          icon={<PhotoLibrary />}
          title={t("noPhotosOwnerTitle")}
          description={t("noPhotosOwnerText", { max: MAX_GRID_IMAGES })}
          action={
            <Button icon={<AddAPhoto />} onClick={() => addInput.current?.click()}>
              {t("addPhoto")}
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.name} className="group relative aspect-square">
              <button
                type="button"
                onClick={() => setLightbox(index)}
                aria-label={t("openPhoto", { number: index + 1 })}
                className="relative block h-full w-full overflow-hidden rounded-xl bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {image.gridUrl && (
                  <Image
                    src={image.gridUrl}
                    alt={t("photoAlt", { name: displayName, number: index + 1 })}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </button>

              {busy === image.name && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-overlay/50 text-white">
                  <Spinner />
                </div>
              )}

              {/* Always visible on touch; revealed on hover/focus with a pointer. */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                {currUser ? (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-card"
                      aria-label={t("replacePhoto")}
                      disabled={busy !== null}
                      onClick={() => {
                        replaceTarget.current = image.name;
                        replaceInput.current?.click();
                      }}
                    >
                      <Edit fontSize="small" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-card hover:text-danger"
                      aria-label={t("deletePhoto")}
                      disabled={busy !== null}
                      onClick={() => void remove(image.name)}
                    >
                      <Delete fontSize="small" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-card"
                    aria-label={t("report")}
                    onClick={() => setReporting(image)}
                  >
                    <Flag fontSize="small" />
                  </Button>
                )}
              </div>
            </li>
          ))}

          {currUser && !full && (
            <li className="aspect-square">
              <button
                type="button"
                onClick={() => addInput.current?.click()}
                disabled={busy !== null}
                className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
              >
                {busy === "new" ? <Spinner /> : <AddAPhoto />}
                {t("addPhoto")}
              </button>
            </li>
          )}
        </ul>
      )}

      {currUser && (
        <>
          <input
            ref={addInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={add}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <input
            ref={replaceInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={replace}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
        </>
      )}

      {open && (
        <Modal
          label={t("photoLightbox")}
          closeModal={() => setLightbox(null)}
          styles="max-w-5xl p-2 pt-12 sm:p-3 sm:pt-12 bg-surface-sunken"
        >
          {open.modalUrl && (
            <Image
              src={open.modalUrl}
              alt={t("photoAlt", { name: displayName, number: (lightbox ?? 0) + 1 })}
              width={1920}
              height={1280}
              unoptimized
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </Modal>
      )}

      {reporting && (
        <ReportPhotoDialog
          ownerId={userId}
          imageLink={reporting.modalUrl ?? reporting.gridUrl ?? ""}
          onClose={() => setReporting(null)}
        />
      )}
    </section>
  );
}
