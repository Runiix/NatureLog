"use client";

import { Check, Close, HideImage, TaskAlt } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useTransition } from "react";
import approveLexiconSubmission, {
  type ApproveEdits,
} from "../../actions/admin/approveLexiconSubmission";
import rejectLexiconSubmission from "../../actions/admin/rejectLexiconSubmission";
import type { LexiconQueueItem } from "../../actions/admin/getLexiconQueue";
import { Link } from "@/i18n/navigation";
import {
  DESCRIPTION_MIN,
  parseAnimalFields,
  parseDescription,
  toFormValues,
  type AnimalFieldErrors,
  type AnimalFields,
} from "@/utils/lexicon/animalFields";
import AnimalFieldsForm from "../lexicon/AnimalFieldsForm";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Field, Input, Textarea } from "../ui/Field";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import { useToast } from "../ui/Toast";

type Kind = "description" | "image" | "new_animal";
type Action = "approve" | "reject";

const proposedData = (item: LexiconQueueItem) =>
  (item.data && typeof item.data === "object" && !Array.isArray(item.data) ? item.data : {}) as Partial<
    AnimalFields
  >;

function Photo({
  src,
  label,
  onOpen,
}: {
  src: string | null;
  label: string;
  onOpen?: () => void;
}) {
  const t = useTranslations("Admin");
  return (
    <figure className="flex flex-col gap-1">
      <figcaption className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</figcaption>
      <button
        type="button"
        onClick={onOpen}
        disabled={!src || !onOpen}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {src ? (
          <Image src={src} alt="" fill unoptimized sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-sm text-fg-subtle">
            <HideImage aria-hidden />
            {t("noPreview")}
          </span>
        )}
      </button>
    </figure>
  );
}

/**
 * Current and proposed photo side by side (the current one only for image
 * proposals), plus the moderation flags on the proposed photo.
 */
function SubmissionPhotos({
  item,
  kind,
  onOpen,
}: {
  item: LexiconQueueItem;
  kind: Kind;
  onOpen: (src: string) => void;
}) {
  const t = useTranslations("Admin");
  const unchecked = item.flagged_categories.includes("unchecked");
  const categories = item.flagged_categories.filter((category) => category !== "unchecked");

  return (
    <>
      {(kind === "image" || item.imageUrl) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {kind === "image" && (
            <Photo
              src={item.animal?.image_link ?? null}
              label={t("lexicon.current")}
              onOpen={item.animal?.image_link ? () => onOpen(item.animal!.image_link!) : undefined}
            />
          )}
          <Photo
            src={item.imageUrl}
            label={t("lexicon.proposed")}
            onOpen={item.imageUrl ? () => onOpen(item.imageUrl!) : undefined}
          />
        </div>
      )}
      {item.imageUrl && unchecked && <p className="text-danger">{t("notChecked")}</p>}
      {categories.length > 0 && (
        <p className="text-danger">{t("flagged", { categories: categories.join(", ") })}</p>
      )}
    </>
  );
}

function SubmissionCard({
  item,
  busy,
  onApprove,
  onReject,
  onOpen,
}: {
  item: LexiconQueueItem;
  busy: Action | null;
  onApprove: (edits: ApproveEdits) => void;
  onReject: (note: string) => void;
  onOpen: (src: string) => void;
}) {
  const t = useTranslations("Admin");
  const tSuggest = useTranslations("LexiconSuggest");
  const format = useFormatter();
  const kind = item.kind as Kind;
  const proposed = proposedData(item);

  const [description, setDescription] = useState(proposed.description ?? "");
  const [fields, setFields] = useState(() => toFormValues(proposed));
  const [errors, setErrors] = useState<AnimalFieldErrors>({});
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function approve() {
    if (kind === "description") {
      const parsed = parseDescription(description);
      if (!parsed.ok) {
        setDescriptionError(tSuggest(`errors.${parsed.error}`, { min: DESCRIPTION_MIN }));
        return;
      }
      setDescriptionError(null);
      onApprove({ description: parsed.value });
    } else if (kind === "new_animal") {
      const parsed = parseAnimalFields(fields);
      if (!parsed.ok) {
        setErrors(parsed.errors);
        return;
      }
      setErrors({});
      onApprove({ fields });
    } else {
      onApprove({});
    }
  }

  return (
    <Card as="li" padding="lg" className="flex flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base font-semibold text-fg">
          {t(`lexicon.kind.${kind}`)}
          {item.animal && (
            <>
              {" · "}
              <Link
                href={`/animalpage/${item.animal.common_name}`}
                className="text-accent-text hover:underline"
              >
                {item.animal.common_name}
              </Link>
            </>
          )}
        </p>
        <p className="text-fg-muted">
          {t("lexicon.suggestedBy", { name: item.username ?? t("unknownUser") })} ·{" "}
          {format.dateTime(new Date(item.created_at), { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      {kind === "description" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-fg">{t("lexicon.current")}</p>
            <p className="whitespace-pre-line rounded-lg bg-surface-sunken p-3 text-fg-muted">
              {item.animal?.description || t("lexicon.noDescription")}
            </p>
          </div>
          <Field label={t("lexicon.proposed")} error={descriptionError ?? undefined}>
            <Textarea
              rows={10}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={busy !== null}
            />
          </Field>
        </div>
      )}

      <SubmissionPhotos item={item} kind={kind} onOpen={onOpen} />

      {kind === "new_animal" && (
        <AnimalFieldsForm
          value={fields}
          onChange={setFields}
          errors={errors}
          disabled={busy !== null}
        />
      )}

      <div className="flex flex-col gap-3 border-t border-border-muted pt-4 sm:flex-row sm:items-end">
        <Field label={t("lexicon.rejectNote")} className="flex-1">
          <Input
            value={note}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy !== null}
          />
        </Field>
        <div className="flex gap-2">
          <Button
            icon={<Check />}
            loading={busy === "approve"}
            disabled={busy !== null}
            onClick={approve}
          >
            {t("approve")}
          </Button>
          <Button
            variant="danger"
            icon={<Close />}
            loading={busy === "reject"}
            disabled={busy !== null}
            onClick={() => onReject(note)}
          >
            {t("reject")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Open lexicon proposals. The admin can edit the proposed text or animal
 * before approving; handled items leave the list at once.
 */
export default function LexiconQueue({ items: initialItems }: { items: LexiconQueueItem[] }) {
  const t = useTranslations("Admin");
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<{ id: string; action: Action } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(item: LexiconQueueItem, action: Action, call: () => Promise<{ success: boolean; error: string | null }>) {
    setBusy({ id: item.id, action });
    startTransition(async () => {
      try {
        const res = await call();
        if (!res.success) throw new Error(res.error ?? "failed");
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        toast(t(action === "approve" ? "lexicon.toast.approved" : "lexicon.toast.rejected"));
      } catch (error) {
        console.error("Lexicon review failed:", error);
        toast(
          error instanceof Error && error.message !== "failed"
            ? t("lexicon.toast.errorWithReason", { reason: error.message })
            : t("toast.error"),
          "error",
        );
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <section aria-labelledby="admin-lexicon" className="flex flex-col gap-4">
      <h2 id="admin-lexicon" className="text-lg font-semibold text-fg sm:text-xl">
        {t("lexicon.pendingTitle")} <span className="text-fg-subtle">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <EmptyState icon={<TaskAlt />} title={t("lexicon.pendingEmpty")} />
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <SubmissionCard
              key={item.id}
              item={item}
              busy={busy?.id === item.id ? busy.action : null}
              onApprove={(edits) => run(item, "approve", () => approveLexiconSubmission(item.id, edits))}
              onReject={(note) => run(item, "reject", () => rejectLexiconSubmission(item.id, note))}
              onOpen={setOpen}
            />
          ))}
        </ul>
      )}
      {open && <PhotoLightbox src={open} alt="" label={t("lexicon.photo")} onClose={() => setOpen(null)} />}
    </section>
  );
}
