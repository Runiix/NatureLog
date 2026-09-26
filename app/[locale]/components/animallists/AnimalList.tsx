"use client";

import { Add, Delete, Edit, Pets, ThumbUp, ThumbUpOutlined } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import deleteAnimalList from "@/app/[locale]/actions/animallists/deleteAnimalList";
import editAnimalList from "@/app/[locale]/actions/animallists/editAnimalList";
import getAnimalListItems from "@/app/[locale]/actions/animallists/getAnimalListItems";
import getCount from "@/app/[locale]/actions/animallists/getCount";
import getUpvotes from "@/app/[locale]/actions/animallists/getUpvotes";
import handleListUpvotes from "@/app/[locale]/actions/animallists/handleListUpvote";
import { cn } from "@/app/[locale]/utils/cn";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import AddAnimalsDialog from "./AddAnimalsDialog";
import AnimalListItem from "./AnimalListItem";
import ListForm from "./ListForm";
import { VisibilityBadge } from "./VisibilityBadge";

const PAGE_SIZE = 20;

export type AnimalListItemType = {
  id: number;
  common_name: string;
  lexicon_link: string | null;
};

/**
 * The list's entries, paged: the first page reloads whenever `reloadItems` is
 * called, later pages load as the sentinel scrolls into view.
 */
function useListItems(listId: string) {
  const [items, setItems] = useState<AnimalListItemType[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Bumped whenever the items are reloaded from page 0. A load-more that
  // started under an older generation discards its result instead of
  // appending stale rows (the old cause of duplicates after a delete).
  const loadGeneration = useRef(0);
  const { ref: sentinelRef, inView } = useInView({ rootMargin: "200px" });

  const reloadItems = () => setRefreshKey((key) => key + 1);

  useEffect(() => {
    const generation = ++loadGeneration.current;
    const loadFirstPage = async () => {
      try {
        const data = await getAnimalListItems(listId, 0, PAGE_SIZE);
        if (generation !== loadGeneration.current) return;
        setItems(data);
        setOffset(1);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error loading animals:", error);
      } finally {
        if (generation === loadGeneration.current) setInitialLoad(false);
      }
    };
    void loadFirstPage();
  }, [listId, refreshKey]);

  useEffect(() => {
    if (!inView || !hasMore || offset === 0) return;
    const generation = loadGeneration.current;
    // A re-run supersedes this page fetch, so its result must not append.
    let cancelled = false;
    const loadNextPage = async () => {
      try {
        const data = await getAnimalListItems(listId, offset, PAGE_SIZE);
        if (cancelled || generation !== loadGeneration.current) return;
        setItems((prev) => [...prev, ...data]);
        setOffset((prev) => prev + 1);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    void loadNextPage();
    return () => {
      cancelled = true;
    };
  }, [inView, hasMore, offset, listId]);

  return { items, initialLoad, hasMore, sentinelRef, refreshKey, reloadItems };
}

/** Entry count and upvotes, refetched with the items; upvoting is optimistic. */
function useListStats(listId: string, refreshKey: number) {
  const t = useTranslations("Lists");
  const toast = useToast();
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotePending, setUpvotePending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [upvote, count] = await Promise.all([getUpvotes(listId), getCount(listId)]);
      if (cancelled) return;
      setHasUpvoted(upvote.hasUpvoted);
      setUpvotes(upvote.upvotes);
      setEntryCount(count);
    };
    load().catch((error) => console.error("Error loading list stats:", error));
    return () => {
      cancelled = true;
    };
  }, [listId, refreshKey]);

  async function toggleUpvote() {
    if (upvotePending) return;
    const next = !hasUpvoted;
    setUpvotePending(true);
    setHasUpvoted(next);
    setUpvotes((prev) => prev + (next ? 1 : -1));
    try {
      const res = await handleListUpvotes(listId, next);
      if (!res.success) {
        setHasUpvoted(!next);
        setUpvotes((prev) => prev + (next ? -1 : 1));
        toast(t("toast.error"), "error");
      }
    } finally {
      setUpvotePending(false);
    }
  }

  return { entryCount, upvotes, hasUpvoted, upvotePending, toggleUpvote };
}

/** Skeletons while the first page loads, then the entries or an empty state. */
function ListEntries({
  items,
  initialLoad,
  listId,
  user,
  spottedList,
  currUser,
  onChanged,
  onAdd,
}: {
  items: AnimalListItemType[];
  initialLoad: boolean;
  listId: string;
  user: User;
  spottedList: number[];
  currUser: boolean;
  onChanged: () => void;
  onAdd: () => void;
}) {
  const t = useTranslations("Lists");
  if (initialLoad) {
    return Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />);
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Pets />}
        title={t("emptyListTitle")}
        description={currUser ? t("emptyListOwnerText") : t("emptyListVisitorText")}
        action={
          currUser ? (
            <Button icon={<Add />} onClick={onAdd}>
              {t("addAnimal")}
            </Button>
          ) : undefined
        }
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((animal) => (
        <AnimalListItem
          key={animal.id}
          listId={listId}
          animalId={animal.id}
          name={animal.common_name}
          image={animal.lexicon_link}
          user={user}
          spottedList={spottedList}
          onRemoved={onChanged}
          currUser={currUser}
        />
      ))}
    </ul>
  );
}

/** Title, visibility, entry count and upvotes; edit and delete for the owner. */
function ListHeader({
  displayTitle,
  description,
  isPublic,
  currUser,
  stats: { entryCount, upvotes, hasUpvoted, upvotePending, toggleUpvote },
  onEdit,
  onDelete,
}: {
  displayTitle: string;
  description: string | null;
  isPublic: boolean;
  currUser: boolean;
  stats: ReturnType<typeof useListStats>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("Lists");
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">{displayTitle}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            <VisibilityBadge isPublic={isPublic} />
            <span>
              {entryCount === null ? (
                <Skeleton className="inline-block h-3 w-16 align-middle" />
              ) : (
                t("entries", { count: entryCount })
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void toggleUpvote()}
            disabled={upvotePending}
            aria-pressed={hasUpvoted}
            aria-label={hasUpvoted ? t("removeUpvote") : t("upvote")}
            icon={hasUpvoted ? <ThumbUp /> : <ThumbUpOutlined />}
            className={cn(hasUpvoted && "border-accent text-accent-text")}
          >
            {upvotes}
          </Button>
          {currUser && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label={t("edit")}
              >
                <Edit />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                aria-label={t("delete")}
                className="hover:text-danger"
              >
                <Delete />
              </Button>
            </>
          )}
        </div>
      </div>
      {description && <p className="max-w-prose text-fg-muted">{description}</p>}
    </header>
  );
}

/**
 * One list's detail view. Title, description and visibility are read from the
 * props on every render: each edit revalidates the page, so the server is the
 * source of truth and there are no local copies to drift.
 */
export default function AnimalList({
  listId,
  title,
  description,
  isPublic,
  user,
  spottedList,
  currUser,
  onDeleted,
}: {
  listId: string;
  title: string | null;
  description: string | null;
  isPublic: boolean;
  user: User;
  spottedList: number[];
  currUser: boolean;
  /** Called after a successful delete so the parent can close the list. */
  onDeleted: () => void;
}) {
  const t = useTranslations("Lists");
  const toast = useToast();

  const { items, initialLoad, hasMore, sentinelRef, refreshKey, reloadItems } = useListItems(listId);
  const stats = useListStats(listId, refreshKey);

  const [dialog, setDialog] = useState<"edit" | "delete" | "add" | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteList() {
    setDeleting(true);
    try {
      const res = await deleteAnimalList(listId);
      if (res.success) {
        setDialog(null);
        toast(t("toast.deleted"));
        onDeleted();
      } else {
        toast(t("toast.error"), "error");
      }
    } finally {
      setDeleting(false);
    }
  }

  const displayTitle = title || t("untitled");

  return (
    <Card variant="solid" padding="lg" className="flex flex-col gap-6">
      <ListHeader
        displayTitle={displayTitle}
        description={description}
        isPublic={isPublic}
        currUser={currUser}
        stats={stats}
        onEdit={() => setDialog("edit")}
        onDelete={() => setDialog("delete")}
      />

      <section aria-label={displayTitle} className="flex flex-col gap-2">
        <ListEntries
          items={items}
          initialLoad={initialLoad}
          listId={listId}
          user={user}
          spottedList={spottedList}
          currUser={currUser}
          onChanged={reloadItems}
          onAdd={() => setDialog("add")}
        />
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4 text-accent" aria-live="polite">
            <Spinner label={t("loadingMore")} />
          </div>
        )}
      </section>

      {currUser && items.length > 0 && (
        <Button icon={<Add />} onClick={() => setDialog("add")} className="self-center">
          {t("addAnimal")}
        </Button>
      )}

      {currUser && dialog === "add" && (
        <AddAnimalsDialog
          listId={listId}
          user={user}
          spottedList={spottedList}
          inList={new Set(items.map((item) => item.id))}
          onChanged={reloadItems}
          onClose={() => setDialog(null)}
        />
      )}

      {currUser && dialog === "edit" && (
        <Modal title={t("editTitle")} closeModal={() => setDialog(null)}>
          <ListForm
            mode="edit"
            initial={{
              title: title ?? "",
              description: description ?? "",
              publicList: isPublic,
            }}
            onCancel={() => setDialog(null)}
            onSubmit={async (values) => {
              const res = await editAnimalList(
                values.title,
                listId,
                values.description,
                values.publicList,
              );
              if (res.success) {
                setDialog(null);
                toast(t("toast.saved"));
              }
              return res;
            }}
          />
        </Modal>
      )}

      {currUser && dialog === "delete" && (
        <Modal title={t("deleteTitle")} closeModal={() => setDialog(null)}>
          <p className="text-fg-muted">{t("deleteText", { title: displayTitle })}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setDialog(null)} disabled={deleting}>
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              icon={<Delete />}
              loading={deleting}
              onClick={() => void deleteList()}
            >
              {t("deleteConfirm")}
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
