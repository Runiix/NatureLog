"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LatLng } from "leaflet";
import { Button } from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import Switch from "../general/Switch";
import MapWithNoSSR from "./Map";
import { MAX_LIST_DESCRIPTION, MAX_LIST_TITLE } from "@/app/[locale]/utils/listValidation";
import type { ActionResult } from "@/app/[locale]/utils/result";

export type ListFormValues = {
  title: string;
  description: string;
  publicList: boolean;
  location: LatLng | null;
};

/**
 * The create and edit forms were the same fields written twice; this is the
 * one copy. Location is only offered when creating — editing never touches it.
 */
export default function ListForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Partial<ListFormValues>;
  onSubmit: (values: ListFormValues) => Promise<ActionResult<unknown>>;
  onCancel: () => void;
}) {
  const t = useTranslations("Lists");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [publicList, setPublicList] = useState(initial?.publicList ?? false);
  const [withLocation, setWithLocation] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleMissing = title.trim().length === 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (titleMissing) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await onSubmit({
        title,
        description,
        publicList,
        location: withLocation ? location : null,
      });
      if (!result.success) setError(t("toast.error"));
    } catch {
      setError(t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field label={t("fields.title")} required hint={`${title.length}/${MAX_LIST_TITLE}`}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("fields.titlePlaceholder")}
          maxLength={MAX_LIST_TITLE}
          autoFocus
        />
      </Field>

      <Field label={t("fields.description")}>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("fields.descriptionPlaceholder")}
          maxLength={MAX_LIST_DESCRIPTION}
        />
      </Field>

      <ToggleRow
        id={`list-public-${mode}`}
        label={t("fields.public")}
        hint={t("fields.publicHint")}
        value={publicList}
        onChange={setPublicList}
      />

      {mode === "create" && (
        <>
          <ToggleRow
            id="list-location"
            label={t("fields.location")}
            hint={withLocation ? t("fields.locationHint") : undefined}
            value={withLocation}
            onChange={setWithLocation}
          />
          {withLocation && (
            <div className="overflow-hidden rounded-lg border border-border">
              <MapWithNoSSR
                onLocationSelect={setLocation}
                height="220px"
                iconUrl="/icons/marker-icon.png"
                setMarker
              />
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          {t("cancel")}
        </Button>
        <Button type="submit" loading={submitting} disabled={titleMissing}>
          {mode === "create" ? t("createSubmit") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {hint && <p className="text-xs text-fg-subtle">{hint}</p>}
      </div>
      <Switch id={id} value={value} onChange={onChange} />
    </div>
  );
}
