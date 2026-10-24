"use client";

import { Favorite, FavoriteBorder, HourglassTop, PhotoCamera, Undo } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toggleEntryLike from "@/app/[locale]/actions/contest/toggleEntryLike";
import withdrawContestEntry from "@/app/[locale]/actions/contest/withdrawContestEntry";
import type { EntryView } from "@/app/[locale]/utils/contest-queries";
import { cn } from "@/app/[locale]/utils/cn";
import { Link } from "@/i18n/navigation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import { useToast } from "../ui/Toast";

/**
 * The entries of a contest. While it takes entries, others' photos can be
 * liked (likes seed the bracket) and the viewer can withdraw their own.
 */
export default function EntryGallery({
  entries: initialEntries,
  open,
  speciesName,
}: {
  entries: EntryView[];
  /** Whether the contest still takes entries and likes. */
  open: boolean;
  speciesName: string;
}) {
  const t = useTranslations("Contest");
  const toast = useToast();
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [busy, setBusy] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<EntryView | null>(null);

  async function like(entry: EntryView) {
    const next = !entry.likedByMe;
    // Relative to the entry as it was before this click, so a revert is exact.
    const apply = (liked: boolean) =>
      setEntries((current) =>
        current.map((e) =>
          e.id === entry.id
            ? { ...e, likedByMe: liked, likes: entry.likes + (liked === entry.likedByMe ? 0 : liked ? 1 : -1) }
            : e,
        ),
      );
    apply(next);
    const res = await toggleEntryLike(entry.id, next);
    if (!res.success) {
      apply(!next);
      toast(t("errors.closed"), "error");
    }
  }

  async function withdraw(entry: EntryView) {
    setBusy(entry.id);
    try {
      const res = await withdrawContestEntry(entry.id);
      if (!res.success) throw new Error(res.error);
      toast(t("toast.withdrawn"));
      router.refresh();
      setEntries((current) => current.filter((e) => e.id !== entry.id));
    } catch (error) {
      console.error("Withdrawing entry failed:", error);
      toast(t("errors.failed"), "error");
    } finally {
      setBusy(null);
    }
  }

  if (entries.length === 0) {
    return <EmptyState icon={<PhotoCamera />} title={t("gallery.emptyTitle")} description={t("gallery.emptyText")} />;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <Card as="li" key={entry.id} padding="none" className={cn("flex flex-col overflow-hidden", entry.isMine && "border-accent")}>
            <button
              type="button"
              onClick={() => setLightbox(entry)}
              disabled={!entry.mainUrl}
              aria-label={t("gallery.open", { name: entry.username ?? t("unknownUser") })}
              className="relative aspect-[4/3] w-full bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {entry.thumbUrl ? (
                <Image src={entry.thumbUrl} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center gap-1 text-sm text-fg-subtle">
                  <HourglassTop fontSize="small" aria-hidden />
                  {t("gallery.inReview")}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 p-3 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {entry.isMine ? (
                  <span className="font-medium text-accent-text">{t("gallery.yours")}</span>
                ) : entry.username ? (
                  <Link href={`/profilepage/${entry.username}`} className="font-medium hover:underline">
                    {entry.username}
                  </Link>
                ) : (
                  t("unknownUser")
                )}
              </span>
              {entry.isMine && open ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Undo />}
                  loading={busy === entry.id}
                  onClick={() => void withdraw(entry)}
                >
                  {t("gallery.withdraw")}
                </Button>
              ) : (
                entry.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={entry.likedByMe ? <Favorite className="text-danger" /> : <FavoriteBorder />}
                    aria-pressed={entry.likedByMe}
                    aria-label={entry.likedByMe ? t("gallery.unlike") : t("gallery.like")}
                    disabled={!open || entry.isMine}
                    onClick={() => void like(entry)}
                  >
                    {entry.likes}
                  </Button>
                )
              )}
            </div>
          </Card>
        ))}
      </ul>
      {lightbox?.mainUrl && (
        <PhotoLightbox
          src={lightbox.mainUrl}
          alt={t("gallery.alt", { name: speciesName, user: lightbox.username ?? t("unknownUser") })}
          label={t("gallery.alt", { name: speciesName, user: lightbox.username ?? t("unknownUser") })}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
