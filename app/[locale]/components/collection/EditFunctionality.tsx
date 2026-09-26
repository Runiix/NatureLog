"use client";

import { AddAPhoto } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import addCollectionImage from "../../actions/collection/addCollectionImage";
import addSpottedDate from "@/app/[locale]/actions/collection/addSpottedDate";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Field";
import { useToast } from "../ui/Toast";

export type SightingUpdate = {
  /** True when a new photo was stored. */
  photoChanged: boolean;
  /** The new first-spotted date (yyyy-mm-dd), when one was saved. */
  date: string | null;
};

const THUMB = { maxSizeMB: 0.02, maxWidthOrHeight: 500, useWebWorker: true };
const FULL = { maxSizeMB: 0.2, maxWidthOrHeight: 1920, useWebWorker: true };

/**
 * Add or change the photo and first-spotted date of a collected species.
 * Reports what was saved to the caller, which used to be handed no-op setters
 * and so never showed the new date.
 */
export default function EditSightingDialog({
  animalId,
  name,
  currentPhoto,
  currentDate,
  onSaved,
  onClose,
}: {
  animalId: number;
  name: string;
  currentPhoto: string | StaticImageData | null;
  /** yyyy-mm-dd or null. */
  currentDate: string | null;
  onSaved: (update: SightingUpdate) => void;
  onClose: () => void;
}) {
  const t = useTranslations("Collection.edit");
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [date, setDate] = useState(currentDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const dateChanged = date !== "" && date !== (currentDate ?? "");
  const today = new Date().toISOString().slice(0, 10);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!file && !dateChanged) {
      setError(t("nothingToSave"));
      return;
    }
    setSaving(true);
    setError(null);
    let pending = false;
    try {
      if (file) {
        const [thumb, full] = await Promise.all([
          imageCompression(file, THUMB),
          imageCompression(file, FULL),
        ]);
        const formData = new FormData();
        formData.append("file", thumb);
        formData.append("modalFile", full);
        formData.append("id", String(animalId));
        if (dateChanged) formData.append("date", date);
        const res = await addCollectionImage(formData);
        if (res.error === "imageRejected") {
          setError(t("imageRejected"));
          return;
        }
        if (!res.success) throw new Error(res.error ?? "upload failed");
        pending = res.pending;
      } else {
        const formData = new FormData();
        formData.append("id", String(animalId));
        formData.append("date", date);
        const res = await addSpottedDate(formData);
        if (!res.success) throw new Error(res.error);
      }
      toast(pending ? t("underReview") : t("saved"));
      // A photo waiting for review is not live yet, so the card keeps the old one.
      onSaved({ photoChanged: file !== null && !pending, date: dateChanged ? date : null });
    } catch (err) {
      console.error("Saving sighting failed:", err);
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  const shown = preview ?? currentPhoto;

  return (
    <Modal title={t("title", { name })} closeModal={() => !saving && onClose()}>
      <form onSubmit={save} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-fg">
            {preview ? t("newPhoto") : t("currentPhoto")}
          </span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-sunken text-fg-muted transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {shown ? (
              <Image src={shown} alt="" fill unoptimized sizes="(min-width: 640px) 512px, 100vw" className="object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <AddAPhoto />
                {t("choosePhoto")}
              </span>
            )}
            {shown && (
              <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {t("changePhoto")}
              </span>
            )}
          </button>
          <p className="text-xs text-fg-subtle">{t("photoHint")}</p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
        </div>

        <Field label={t("date")} error={error ?? undefined}>
          <Input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button type="submit" loading={saving}>
            {t("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
