"use client";

import { Add, ArrowDownward, ArrowUpward, CollectionsBookmark, RemoveCircleOutline } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import demoteSet from "../../actions/admin/demoteSet";
import type { SetCandidate } from "../../actions/admin/getSetCandidates";
import promoteSet from "../../actions/admin/promoteSet";
import reorderSets from "../../actions/admin/reorderSets";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/Toast";

/**
 * Species sets are the admin's own public lists, promoted here. Their content
 * is edited on the lists page like any other list.
 */
export default function SetAdmin({ candidates }: { candidates: SetCandidate[] }) {
  const t = useTranslations("Admin.sets");
  const toast = useToast();
  const [items, setItems] = useState(candidates);
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sets = items.filter((item) => item.isSet);
  const others = items.filter((item) => !item.isSet);

  function run(listId: string, action: () => Promise<{ success: boolean }>, next: SetCandidate[]) {
    setBusy(listId);
    startTransition(async () => {
      try {
        const res = await action();
        if (!res.success) throw new Error("Set action failed");
        setItems(next);
      } catch (error) {
        console.error(error);
        toast(t("error"), "error");
      } finally {
        setBusy(null);
      }
    });
  }

  function move(index: number, offset: -1 | 1) {
    const order = [...sets];
    [order[index], order[index + offset]] = [order[index + offset], order[index]];
    run(order[index].listId, () => reorderSets(order.map((item) => item.listId)), [...order, ...others]);
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="admin-sets" className="flex flex-col gap-3">
        <h2 id="admin-sets" className="text-lg font-semibold text-fg sm:text-xl">
          {t("title")} <span className="text-fg-subtle">({sets.length})</span>
        </h2>
        <p className="text-sm text-fg-muted">{t("hint")}</p>
        {sets.length === 0 ? (
          <EmptyState icon={<CollectionsBookmark />} title={t("empty")} />
        ) : (
          <ol className="flex flex-col gap-2">
            {sets.map((item, index) => (
              <Card as="li" key={item.listId} padding="sm" className="flex items-center gap-2">
                <span className="w-6 text-center text-sm tabular-nums text-fg-subtle">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.title || t("untitled")}</span>
                  <span className="text-xs text-fg-muted">{t("entries", { count: item.entryCount })}</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("moveUp")}
                  disabled={busy !== null || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUpward />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("moveDown")}
                  disabled={busy !== null || index === sets.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownward />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RemoveCircleOutline />}
                  loading={busy === item.listId}
                  disabled={busy !== null}
                  onClick={() =>
                    run(item.listId, () => demoteSet(item.listId), items.map((entry) =>
                      entry.listId === item.listId ? { ...entry, isSet: false } : entry,
                    ))
                  }
                >
                  {t("demote")}
                </Button>
              </Card>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="admin-set-candidates" className="flex flex-col gap-3">
        <h2 id="admin-set-candidates" className="text-lg font-semibold text-fg sm:text-xl">
          {t("candidates")}
        </h2>
        {others.length === 0 ? (
          <p className="text-sm text-fg-muted">{t("noCandidates")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {others.map((item) => (
              <Card as="li" key={item.listId} padding="sm" className="flex items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{item.title || t("untitled")}</span>
                  <span className="text-xs text-fg-muted">{t("entries", { count: item.entryCount })}</span>
                </span>
                <Button
                  size="sm"
                  icon={<Add />}
                  loading={busy === item.listId}
                  disabled={busy !== null}
                  onClick={() =>
                    run(item.listId, () => promoteSet(item.listId), [
                      ...sets,
                      { ...item, isSet: true },
                      ...others.filter((entry) => entry.listId !== item.listId),
                    ])
                  }
                >
                  {t("promote")}
                </Button>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
