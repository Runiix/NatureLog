"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";
import {
  COLORS,
  ENDANGERMENT,
  GENERA,
  ORDERS_BY_GENUS,
} from "@/app/[locale]/utils/lexiconFilters";
import {
  DESCRIPTION_MIN,
  type AnimalFieldErrors,
  type AnimalFormValues,
  type FieldError,
} from "@/utils/lexicon/animalFields";
import { Field, Input, Select, Textarea } from "../ui/Field";

/**
 * Every column of an animal as a form. Used by users suggesting a missing
 * animal, by admins reviewing that suggestion, and by admins creating an
 * animal directly; only the admin form shows the credit and licence fields.
 * Controlled: the parent owns the values and the validation errors.
 */
export default function AnimalFieldsForm({
  value,
  onChange,
  errors = {},
  showCredit = false,
  disabled = false,
}: {
  value: AnimalFormValues;
  onChange: (value: AnimalFormValues) => void;
  errors?: AnimalFieldErrors;
  showCredit?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("LexiconSuggest");
  const tLex = useTranslations("Lexicon");

  const set = <K extends keyof AnimalFormValues>(key: K, next: AnimalFormValues[K]) =>
    onChange({ ...value, [key]: next });
  const error = (key: keyof AnimalFormValues) => {
    const code: FieldError | undefined = errors[key];
    return code ? t(`errors.${code}`, { min: DESCRIPTION_MIN }) : undefined;
  };
  const text = (key: keyof AnimalFormValues, props: { required?: boolean; hint?: string } = {}) => (
    <Field label={t(`fields.${key}`)} error={error(key)} required={props.required} hint={props.hint}>
      <Input
        value={value[key] as string}
        onChange={(event) => set(key, event.target.value)}
        disabled={disabled}
      />
    </Field>
  );

  const orders = ORDERS_BY_GENUS[value.category];
  const label = (raw: string) => (tLex.has(raw) ? tLex(raw) : raw);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">{t("germanHint")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {text("common_name", { required: true })}
        {text("scientific_name", { required: true })}

        <Field label={t("fields.category")} error={error("category")} required>
          <Select
            value={value.category}
            // A new group has different orders, so the old choice no longer fits.
            onChange={(event) =>
              onChange({ ...value, category: event.target.value, taxonomic_order: "" })
            }
            disabled={disabled}
          >
            <option value="">{t("choose")}</option>
            {GENERA.map((genus) => (
              <option key={genus} value={genus}>
                {label(genus)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={t("fields.taxonomic_order")}
          error={error("taxonomic_order")}
          required={Boolean(orders)}
        >
          <Select
            value={value.taxonomic_order}
            onChange={(event) => set("taxonomic_order", event.target.value)}
            disabled={disabled || !orders}
          >
            <option value="">{orders ? t("choose") : t("noOrders")}</option>
            {orders?.map((order) => (
              <option key={order} value={order}>
                {order}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("fields.endangerment_status")} error={error("endangerment_status")} required>
          <Select
            value={value.endangerment_status}
            onChange={(event) => set("endangerment_status", event.target.value)}
            disabled={disabled}
          >
            <option value="">{t("choose")}</option>
            {ENDANGERMENT.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </Select>
        </Field>

        {text("population_estimate")}
        {text("size_from", { hint: t("sizeHint") })}
        {text("size_to", { hint: t("sizeHint") })}
        {text("presence_time")}
        {text("sexual_dimorphism")}
      </div>

      <Field label={t("fields.description")} error={error("description")}>
        <Textarea
          rows={6}
          value={value.description}
          onChange={(event) => set("description", event.target.value)}
          disabled={disabled}
        />
      </Field>

      <Field label={t("fields.habitat")} error={error("habitat")}>
        <Textarea
          rows={2}
          value={value.habitat}
          onChange={(event) => set("habitat", event.target.value)}
          disabled={disabled}
        />
      </Field>

      {text("similar_animals", { hint: t("similarHint") })}

      <fieldset className="flex flex-col gap-2" disabled={disabled}>
        <legend className="mb-1.5 text-sm font-medium text-fg">{t("fields.colors")}</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => {
            const checked = value.colors.includes(color.value);
            return (
              <label
                key={color.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                  checked ? "border-accent bg-accent/10 text-fg" : "border-border text-fg-muted",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() =>
                    set(
                      "colors",
                      checked
                        ? value.colors.filter((entry) => entry !== color.value)
                        : [...value.colors, color.value],
                    )
                  }
                />
                <span aria-hidden className={cn("h-3.5 w-3.5 rounded-full border border-border", color.swatch)} />
                {label(color.value)}
              </label>
            );
          })}
        </div>
        {error("colors") && <p className="text-xs text-danger">{error("colors")}</p>}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={value.very_rare}
          onChange={(event) => set("very_rare", event.target.checked)}
          disabled={disabled}
          className="h-4 w-4 shrink-0 rounded border-border accent-[rgb(var(--color-accent))]"
        />
        {t("fields.very_rare")}
      </label>

      {showCredit && (
        <div className="grid gap-4 border-t border-border-muted pt-4 sm:grid-cols-2">
          {text("image_credit_text")}
          {text("image_credit_link")}
          {text("image_license_text")}
          {text("image_license_link")}
        </div>
      )}
    </div>
  );
}
