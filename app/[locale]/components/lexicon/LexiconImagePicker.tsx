"use client";

import { AddAPhoto, Delete } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";

const THUMB = { maxSizeMB: 0.05, maxWidthOrHeight: 600, useWebWorker: true };
const FULL = { maxSizeMB: 0.4, maxWidthOrHeight: 1920, useWebWorker: true };

/**
 * Compresses a picked photo into the two sizes the lexicon stores: the grid
 * thumbnail and the banner. Appended as `file` and `modalFile`, like every
 * other upload in the app.
 */
export async function appendLexiconImage(formData: FormData, file: File) {
  const [thumb, full] = await Promise.all([
    imageCompression(file, THUMB),
    imageCompression(file, FULL),
  ]);
  formData.append("file", thumb);
  formData.append("modalFile", full);
}

/**
 * Photo picker with preview. With `consent`, it also shows the licence
 * checkbox users must tick for their own photos.
 */
export default function LexiconImagePicker({
  file,
  onFileChange,
  consent,
  onConsentChange,
  disabled = false,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Omit to hide the consent checkbox (admins enter credit themselves). */
  consent?: boolean;
  onConsentChange?: (consent: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("LexiconSuggest.image");
  const input = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  // The parent may clear the file (after a submit); the old preview goes with it.
  const preview = file ? objectUrl : null;

  // Object URLs hold the file in memory until revoked: on replacement and on
  // unmount.
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  function pick(next: File | null) {
    setObjectUrl(next ? URL.createObjectURL(next) : null);
    onFileChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          pick(event.target.files?.[0] ?? null);
          // Lets the same file be picked again after it was cleared.
          event.target.value = "";
        }}
      />
      {preview ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-sunken">
          <Image src={preview} alt={t("preview")} fill unoptimized className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon={<AddAPhoto />}
          onClick={() => input.current?.click()}
          disabled={disabled}
        >
          {file ? t("change") : t("choose")}
        </Button>
        {file && (
          <Button
            variant="ghost"
            icon={<Delete />}
            onClick={() => pick(null)}
            disabled={disabled}
          >
            {t("remove")}
          </Button>
        )}
      </div>
      {file && onConsentChange && (
        <label className="flex items-start gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={consent ?? false}
            onChange={(event) => onConsentChange(event.target.checked)}
            disabled={disabled}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[rgb(var(--color-accent))]"
          />
          {t("consent")}
        </label>
      )}
    </div>
  );
}
