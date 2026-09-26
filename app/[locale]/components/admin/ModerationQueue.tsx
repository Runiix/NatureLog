"use client";

import { Check, Close, Delete, HideImage, TaskAlt } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";
import approveImage from "../../actions/admin/approveImage";
import rejectImage from "../../actions/admin/rejectImage";
import takeDownImage from "../../actions/admin/takeDownImage";
import type { ModerationItem } from "../../actions/admin/getModerationQueue";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import { useToast } from "../ui/Toast";

type Action = "approve" | "reject" | "takeDown";

const ACTIONS = { approve: approveImage, reject: rejectImage, takeDown: takeDownImage };
const DONE_TOAST = { approve: "approved", reject: "rejected", takeDown: "takenDown" } as const;

function ModerationCard({
  item,
  busy,
  onAction,
  onOpen,
}: {
  item: ModerationItem;
  busy: Action | null;
  onAction: (action: Action) => void;
  onOpen: () => void;
}) {
  const t = useTranslations("Admin");
  const format = useFormatter();
  const pending = item.status === "pending";
  const unchecked = item.flagged_categories.includes("unchecked");
  const categories = item.flagged_categories.filter((category) => category !== "unchecked");

  return (
    <Card as="li" padding="none" className="flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        disabled={!item.imageUrl}
        className="relative aspect-[4/3] w-full bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-sm text-fg-subtle">
            <HideImage aria-hidden />
            {t("noPreview")}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
        <p className="font-semibold text-fg">{t(`kind.${item.kind as ModerationKind}`)}</p>
        <p className="text-fg-muted">
          {t("uploadedBy", { name: item.username ?? t("unknownUser") })} ·{" "}
          {format.dateTime(new Date(item.created_at), { dateStyle: "medium", timeStyle: "short" })}
        </p>
        {pending && unchecked && <p className="text-danger">{t("notChecked")}</p>}
        {categories.length > 0 && (
          <p className="text-danger">{t("flagged", { categories: categories.join(", ") })}</p>
        )}
        {!pending && (
          <p className="text-fg-subtle">
            {item.decided_by === "admin" ? t("decidedAdmin") : t("decidedAuto")}
          </p>
        )}
        <div className="mt-auto flex gap-2 pt-2">
          {pending ? (
            <>
              <Button
                size="sm"
                icon={<Check />}
                loading={busy === "approve"}
                disabled={busy !== null}
                onClick={() => onAction("approve")}
                className="flex-1"
              >
                {t("approve")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<Close />}
                loading={busy === "reject"}
                disabled={busy !== null}
                onClick={() => onAction("reject")}
                className="flex-1"
              >
                {t("reject")}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              icon={<Delete />}
              loading={busy === "takeDown"}
              disabled={busy !== null}
              onClick={() => onAction("takeDown")}
              fullWidth
            >
              {t("takeDown")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

type ModerationKind = "profile_picture" | "profile_grid" | "collection";

/**
 * The admin's two lists: images waiting for a decision, and recently approved
 * images that can still be taken down. Handled items leave the list at once.
 */
export default function ModerationQueue({
  pending: initialPending,
  recent: initialRecent,
}: {
  pending: ModerationItem[];
  recent: ModerationItem[];
}) {
  const t = useTranslations("Admin");
  const toast = useToast();
  const [pending, setPending] = useState(initialPending);
  const [recent, setRecent] = useState(initialRecent);
  const [busy, setBusy] = useState<{ id: string; action: Action } | null>(null);
  const [open, setOpen] = useState<ModerationItem | null>(null);
  const [, startTransition] = useTransition();

  function run(item: ModerationItem, action: Action) {
    setBusy({ id: item.id, action });
    startTransition(async () => {
      try {
        const res = await ACTIONS[action](item.id);
        if (!res.success) throw new Error(res.error);
        if (action === "takeDown") {
          setRecent((current) => current.filter((entry) => entry.id !== item.id));
        } else {
          setPending((current) => current.filter((entry) => entry.id !== item.id));
          if (action === "approve") {
            setRecent((current) => [
              { ...item, status: "approved", decided_by: "admin", imageUrl: null },
              ...current,
            ]);
          }
        }
        toast(t(`toast.${DONE_TOAST[action]}`));
      } catch (error) {
        console.error("Moderation action failed:", error);
        toast(t("toast.error"), "error");
      } finally {
        setBusy(null);
      }
    });
  }

  const section = (
    id: string,
    title: string,
    items: ModerationItem[],
    empty: string,
    emptyIcon: React.ReactNode,
  ) => (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-lg font-semibold text-fg sm:text-xl">
        {title} <span className="text-fg-subtle">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <EmptyState icon={emptyIcon} title={empty} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ModerationCard
              key={item.id}
              item={item}
              busy={busy?.id === item.id ? busy.action : null}
              onAction={(action) => run(item, action)}
              onOpen={() => setOpen(item)}
            />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <>
      {section("admin-pending", t("pendingTitle"), pending, t("pendingEmpty"), <TaskAlt />)}
      {section("admin-recent", t("recentTitle"), recent, t("recentEmpty"), <TaskAlt />)}
      {open?.imageUrl && (
        <PhotoLightbox
          src={open.imageUrl}
          alt=""
          label={t(`kind.${open.kind as ModerationKind}`)}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
