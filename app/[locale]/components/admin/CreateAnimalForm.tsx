"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import createAnimal from "../../actions/admin/createAnimal";
import {
  EMPTY_ANIMAL_FORM,
  parseAnimalFields,
  type AnimalFieldErrors,
} from "@/utils/lexicon/animalFields";
import AnimalFieldsForm from "../lexicon/AnimalFieldsForm";
import LexiconImagePicker, { appendLexiconImage } from "../lexicon/LexiconImagePicker";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { useToast } from "../ui/Toast";

/** Adds an animal to the lexicon directly, with the same form users suggest with. */
export default function CreateAnimalForm() {
  const t = useTranslations("Admin.createAnimal");
  const tSuggest = useTranslations("LexiconSuggest");
  const toast = useToast();
  const [values, setValues] = useState(EMPTY_ANIMAL_FORM);
  const [errors, setErrors] = useState<AnimalFieldErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setCreated(null);
    const parsed = parseAnimalFields(values, { allowCredit: true });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setError(tSuggest("fixErrors"));
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fields", JSON.stringify(parsed.value));
      if (file) await appendLexiconImage(formData, file);
      const res = await createAnimal(formData);
      if (!res.success) {
        setError(t(`errors.${res.error}` as "errors.failed"));
        return;
      }
      toast(t("created", { name: res.data }));
      setCreated(res.data);
      setValues(EMPTY_ANIMAL_FORM);
      setFile(null);
    } catch (err) {
      console.error("Creating animal failed:", err);
      setError(t("errors.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="form" padding="lg" onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <h2 className="text-lg font-semibold text-fg sm:text-xl">{t("title")}</h2>
      <AnimalFieldsForm
        value={values}
        onChange={setValues}
        errors={errors}
        showCredit
        disabled={saving}
      />
      <div className="flex flex-col gap-2 border-t border-border-muted pt-4">
        <h3 className="text-sm font-medium text-fg">{tSuggest("image.label")}</h3>
        <LexiconImagePicker file={file} onFileChange={setFile} disabled={saving} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {created && (
          <ButtonLink href={`/animalpage/${created}`} variant="link">
            {t("view", { name: created })}
          </ButtonLink>
        )}
        <Button type="submit" loading={saving}>
          {t("submit")}
        </Button>
      </div>
    </Card>
  );
}
