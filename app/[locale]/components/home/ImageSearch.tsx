"use client";

import { AddAPhoto, ImageSearch as ImageSearchIcon, OpenInNew } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import uploadSearchImage from "@/app/[locale]/actions/home/uploadSearchImage";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

/**
 * Reverse image search: pick a photo, it is uploaded (server-validated) and
 * then opened in Google Lens. One button does both steps after picking; it
 * used to be three numbered buttons and alert() dialogs.
 */
export default function ImageSearch() {
  const t = useTranslations("Home.imageSearch");
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function upload() {
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await uploadSearchImage(formData);
      if (res.success) {
        setPublicUrl(res.data);
        toast(t("uploaded"));
      } else {
        toast(
          res.error === "Invalid image"
            ? t("invalid")
            : res.error === "imageRejected"
              ? t("rejected")
              : t("error"),
          "error",
        );
      }
    } catch {
      toast(t("error"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-sm text-fg-muted">{t("text")}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-sunken text-sm text-fg-muted transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {preview ? (
          <Image src={preview} alt="" fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2">
            <AddAPhoto />
            {t("choose")}
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setPublicUrl(null);
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        {publicUrl ? (
          <Button
            fullWidth
            icon={<OpenInNew />}
            onClick={() =>
              window.open(
                `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(publicUrl)}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            {t("search")}
          </Button>
        ) : (
          <Button
            fullWidth
            icon={<ImageSearchIcon />}
            loading={busy}
            disabled={!file}
            onClick={() => void upload()}
          >
            {t("upload")}
          </Button>
        )}
      </div>
    </div>
  );
}
