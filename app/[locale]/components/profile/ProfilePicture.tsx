"use client";

import { Delete, Flag, PhotoCamera, Person } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import changeProfilePicture from "../../actions/profile/changeProfilePicture";
import removeProfilePicture from "../../actions/profile/removeProfilePicture";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import ReportPhotoDialog from "./ReportPhotoDialog";

export default function ProfilePicture({
  userId,
  displayName,
  currUser,
  profilePic,
  profilePicUrl,
}: {
  userId: string;
  displayName: string;
  currUser: boolean;
  profilePic: boolean;
  profilePicUrl: string;
}) {
  const t = useTranslations("Profile");
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(profilePicUrl);
  const [hasPicture, setHasPicture] = useState(profilePic && !!profilePicUrl);
  const [uploading, setUploading] = useState(false);
  const [reporting, setReporting] = useState(false);

  async function remove() {
    setUploading(true);
    try {
      const res = await removeProfilePicture();
      if (res.success) {
        setHasPicture(false);
        toast(t("toast.avatarDeleted"));
      } else {
        toast(t("toast.error"), "error");
      }
    } catch (error) {
      console.error("Profile picture removal failed:", error);
      toast(t("toast.error"), "error");
    } finally {
      setUploading(false);
    }
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await changeProfilePicture(formData);
      if (res.success && res.pending) {
        toast(t("toast.underReview"));
      } else if (res.success) {
        // A local preview avoids waiting on storage/CDN for the new object.
        setUrl(URL.createObjectURL(compressed));
        setHasPicture(true);
        toast(t("toast.uploaded"));
      } else {
        toast(
          res.error === "imageRejected" ? t("toast.imageRejected") : t("toast.error"),
          "error",
        );
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      toast(t("toast.error"), "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-surface-sunken ring-4 ring-surface sm:h-32 sm:w-32">
        {hasPicture ? (
          <Image
            src={url}
            alt={t("avatarAlt", { name: displayName })}
            fill
            sizes="128px"
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-fg-subtle [&_svg]:h-16 [&_svg]:w-16">
            <Person aria-hidden />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-overlay/50 text-white">
            <Spinner />
          </div>
        )}
      </div>

      {currUser ? (
        <>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            aria-label={t("changeAvatar")}
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-card"
          >
            <PhotoCamera fontSize="small" />
          </Button>
          {hasPicture && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void remove()}
              disabled={uploading}
              aria-label={t("deleteAvatar")}
              className="absolute bottom-0 left-0 h-9 w-9 rounded-full shadow-card hover:text-danger"
            >
              <Delete fontSize="small" />
            </Button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
        </>
      ) : (
        hasPicture && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setReporting(true)}
            aria-label={t("report")}
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-card"
          >
            <Flag fontSize="small" />
          </Button>
        )
      )}

      {reporting && (
        <ReportPhotoDialog ownerId={userId} imageLink={url} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
