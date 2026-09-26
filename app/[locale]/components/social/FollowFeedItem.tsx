"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import type { FeedEntry } from "@/app/[locale]/actions/social/getFeed";
import { avatarUrl } from "@/app/[locale]/utils/avatars";
import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import { Link } from "@/i18n/navigation";
import { Avatar } from "../ui/Avatar";
import { PhotoLightbox } from "../ui/PhotoLightbox";

function publicPhotoUrl(userId: string, folder: "Collection" | "CollectionModals", animal: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${userId}/${folder}/${collectionImageName(animal)}`;
}

/** One entry in the follow feed: who, what, when, and the photo if any. */
export default function FollowFeedItem({ post }: { post: FeedEntry }) {
  const t = useTranslations("Social");
  const format = useFormatter();
  const [open, setOpen] = useState(false);

  // A sighting whose animal or author could not be resolved has nothing to
  // link to, so it is dropped rather than rendered with empty labels.
  if (!post.common_name || !post.username || !post.user_id) return null;
  const animal = post.common_name;
  const author = post.username;
  const when = post.image_updated_at ?? post.first_spotted_at;

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border-muted bg-surface-raised p-3">
      <div className="flex items-start gap-2.5">
        <Avatar src={avatarUrl(post.user_id)} name={author} alt="" size="sm" />
        <p className="min-w-0 text-sm leading-snug text-fg-muted">
          <Link
            href={`/profilepage/${author}`}
            className="font-semibold text-fg hover:text-accent-text hover:underline"
          >
            {author}
          </Link>{" "}
          {post.image ? t("feedNewPhoto") : t("feedNewSpecies")}{" "}
          <Link
            href={`/animalpage/${animal}`}
            className="font-medium text-accent-text hover:underline"
          >
            {animal}
          </Link>
          {when && (
            <time dateTime={when} className="block text-xs text-fg-subtle">
              {format.relativeTime(new Date(when))}
            </time>
          )}
        </p>
      </div>
      {post.image && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative aspect-video w-full overflow-hidden rounded-md bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image
            src={publicPhotoUrl(post.user_id, "Collection", animal)}
            alt={t("feedPhotoAlt", { animal, name: author })}
            fill
            unoptimized
            sizes="(min-width: 1280px) 22rem, 100vw"
            className="object-cover"
          />
        </button>
      )}
      {open && (
        <PhotoLightbox
          src={publicPhotoUrl(post.user_id, "CollectionModals", animal)}
          alt={t("feedPhotoAlt", { animal, name: author })}
          label={animal}
          onClose={() => setOpen(false)}
        />
      )}
    </article>
  );
}
