"use client";

import { Delete, DoneAll, HideImage, TaskAlt } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";
import dismissReports from "../../actions/admin/dismissReports";
import removeReportedImage from "../../actions/admin/removeReportedImage";
import type { ReportedItem } from "../../actions/admin/getReports";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import { useToast } from "../ui/Toast";

type Action = "remove" | "dismiss";

function ReportCard({
  item,
  busy,
  onAction,
  onOpen,
}: {
  item: ReportedItem;
  busy: Action | null;
  onAction: (action: Action) => void;
  onOpen: () => void;
}) {
  const t = useTranslations("Admin");
  const format = useFormatter();

  return (
    <Card as="li" padding="none" className="flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        disabled={!item.imageUrl}
        className="relative aspect-[4/3] w-full bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-sm text-fg-subtle">
            <HideImage aria-hidden />
            {t("reports.imageGone")}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
        <p className="font-semibold text-fg">{t(`kind.${item.kind}`)}</p>
        <p className="text-fg-muted">
          {t("uploadedBy", { name: item.username ?? t("unknownUser") })}
        </p>
        <p className="font-medium text-danger">
          {t("reports.count", { count: item.reports.length })}
        </p>
        <ul className="flex max-h-40 flex-col gap-2 overflow-y-auto">
          {item.reports.map((report) => (
            <li key={report.id} className="rounded-md bg-surface-sunken px-3 py-2">
              <p className="whitespace-pre-wrap break-words text-fg">
                {report.text || <span className="text-fg-subtle">{t("reports.noReason")}</span>}
              </p>
              <p className="mt-1 text-xs text-fg-subtle">
                {format.dateTime(new Date(report.created_at), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            size="sm"
            variant="danger"
            icon={<Delete />}
            loading={busy === "remove"}
            disabled={busy !== null || !item.imageUrl}
            onClick={() => onAction("remove")}
            className="flex-1"
          >
            {t("reports.remove")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<DoneAll />}
            loading={busy === "dismiss"}
            disabled={busy !== null}
            onClick={() => onAction("dismiss")}
            className="flex-1"
          >
            {t("reports.dismiss")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Reported images, one card per image with every reason given. Removing takes
 * the image down; dismissing keeps it and closes the reports.
 */
export default function ReportQueue({ items: initialItems }: { items: ReportedItem[] }) {
  const t = useTranslations("Admin");
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<{ path: string; action: Action } | null>(null);
  const [open, setOpen] = useState<ReportedItem | null>(null);
  const [, startTransition] = useTransition();

  function run(item: ReportedItem, action: Action) {
    setBusy({ path: item.path, action });
    startTransition(async () => {
      try {
        const res =
          action === "remove"
            ? await removeReportedImage(item.path)
            : await dismissReports(item.reports.map((report) => report.id));
        if (!res.success) throw new Error(res.error);
        setItems((current) => current.filter((entry) => entry.path !== item.path));
        toast(t(action === "remove" ? "toast.takenDown" : "reports.dismissed"));
      } catch (error) {
        console.error("Report action failed:", error);
        toast(t("toast.error"), "error");
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <>
      <section aria-labelledby="admin-reports" className="flex flex-col gap-4">
        <h2 id="admin-reports" className="text-lg font-semibold text-fg sm:text-xl">
          {t("reports.title")} <span className="text-fg-subtle">({items.length})</span>
        </h2>
        {items.length === 0 ? (
          <EmptyState icon={<TaskAlt />} title={t("reports.empty")} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ReportCard
                key={item.path}
                item={item}
                busy={busy?.path === item.path ? busy.action : null}
                onAction={(action) => run(item, action)}
                onOpen={() => setOpen(item)}
              />
            ))}
          </ul>
        )}
      </section>
      {open?.imageUrl && (
        <PhotoLightbox
          src={open.imageUrl}
          alt=""
          label={t(`kind.${open.kind}`)}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
