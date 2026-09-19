"use client";

import { PhotoLibrary } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "../ui/EmptyState";
import { PhotoLightbox } from "../ui/PhotoLightbox";

export type CommunityPhoto = { id: string; display_name: string; imageUrl: string };

/** Recent community photos of one species as a grid with a lightbox. */
export default function RecentAnimalImageUploads({
  data,
  animal,
}: {
  data: CommunityPhoto[];
  animal: string;
}) {
  const t = useTranslations("Animal");
  const [open, setOpen] = useState<CommunityPhoto | null>(null);

  if (data.length === 0) {
    return <EmptyState icon={<PhotoLibrary />} title={t("noPhotos")} />;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((photo) => (
          <li key={photo.id} className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(photo)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src={photo.imageUrl}
                alt={t("photoAlt", { animal, name: photo.display_name })}
                fill
                unoptimized
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
            <Link
              href={`/profilepage/${photo.display_name}`}
              className="truncate text-sm text-fg-muted hover:text-accent-text hover:underline"
            >
              {t("photoBy", { name: photo.display_name })}
            </Link>
          </li>
        ))}
      </ul>
      {open && (
        <PhotoLightbox
          src={open.imageUrl}
          alt={t("photoAlt", { animal, name: open.display_name })}
          label={t("photoBy", { name: open.display_name })}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
