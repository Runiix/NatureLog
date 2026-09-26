"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import submitLexiconSuggestion from "../../actions/lexicon/submitLexiconSuggestion";
import {
  EMPTY_ANIMAL_FORM,
  parseAnimalFields,
  type AnimalFieldErrors,
} from "@/utils/lexicon/animalFields";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useToast } from "../ui/Toast";
import AnimalFieldsForm from "./AnimalFieldsForm";
import LexiconImagePicker from "./LexiconImagePicker";
import { appendLexiconImage } from "@/app/[locale]/utils/lexiconImage";

/** A user's proposal for an animal the lexicon does not have yet. */
export default function SuggestAnimalForm() {
  const t = useTranslations("LexiconSuggest");
  const toast = useToast();
  const router = useRouter();
  const [values, setValues] = useState(EMPTY_ANIMAL_FORM);
  const [errors, setErrors] = useState<AnimalFieldErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = parseAnimalFields(values);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setError(t("fixErrors"));
      return;
    }
    setErrors({});
    if (file && !consent) {
      setError(t("submitErrors.consentMissing"));
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("kind", "new_animal");
      formData.append("fields", JSON.stringify(parsed.value));
      if (file) {
        formData.append("consent", "true");
        await appendLexiconImage(formData, file);
      }
      const res = await submitLexiconSuggestion(formData);
      if (!res.success) {
        setError(t(`submitErrors.${res.error}` as "submitErrors.failed"));
        return;
      }
      toast(t("submitted"));
      setValues(EMPTY_ANIMAL_FORM);
      setFile(null);
      setConsent(false);
      router.refresh();
    } catch (err) {
      console.error("Suggestion failed:", err);
      setError(t("submitErrors.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="form" padding="lg" onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <AnimalFieldsForm value={values} onChange={setValues} errors={errors} disabled={saving} />
      <div className="flex flex-col gap-2 border-t border-border-muted pt-4">
        <h2 className="text-sm font-medium text-fg">{t("image.label")}</h2>
        <LexiconImagePicker
          file={file}
          onFileChange={setFile}
          consent={consent}
          onConsentChange={setConsent}
          disabled={saving}
        />
      </div>
      <p className="text-xs text-fg-subtle">{t("reviewHint")}</p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" loading={saving} className="self-end">
        {t("submit")}
      </Button>
    </Card>
  );
}
