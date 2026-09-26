"use client";

import { EditNote } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import submitLexiconSuggestion from "../../actions/lexicon/submitLexiconSuggestion";
import { cn } from "@/app/[locale]/utils/cn";
import { DESCRIPTION_MIN, parseDescription } from "@/utils/lexicon/animalFields";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { Field, Textarea } from "../ui/Field";
import { useToast } from "../ui/Toast";
import LexiconImagePicker from "./LexiconImagePicker";
import { appendLexiconImage } from "@/app/[locale]/utils/lexiconImage";

type Tab = "description" | "image";

/**
 * "Suggest improvement" on an animal page: propose a new description or a new
 * photo. Both wait for an admin; nothing changes on the page right away.
 */
export default function SuggestEditDialog({
  animalId,
  animalName,
  currentDescription,
}: {
  animalId: number;
  animalName: string;
  currentDescription: string | null;
}) {
  const t = useTranslations("LexiconSuggest");
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("description");
  const [description, setDescription] = useState(currentDescription ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("kind", tab);
    formData.append("animalId", String(animalId));
    if (tab === "description") {
      const parsed = parseDescription(description);
      if (!parsed.ok) {
        setError(t(`errors.${parsed.error}`, { min: DESCRIPTION_MIN }));
        return;
      }
      if (parsed.value === (currentDescription ?? "").trim()) {
        setError(t("unchanged"));
        return;
      }
      formData.append("description", parsed.value);
    } else {
      if (!file) {
        setError(t("image.missing"));
        return;
      }
      if (!consent) {
        setError(t("submitErrors.consentMissing"));
        return;
      }
      formData.append("consent", "true");
    }

    setSaving(true);
    try {
      if (tab === "image" && file) await appendLexiconImage(formData, file);
      const res = await submitLexiconSuggestion(formData);
      if (!res.success) {
        setError(t(`submitErrors.${res.error}` as "submitErrors.failed"));
        return;
      }
      toast(t("submitted"));
      setFile(null);
      setConsent(false);
      close();
    } catch (err) {
      console.error("Suggestion failed:", err);
      setError(t("submitErrors.failed"));
    } finally {
      setSaving(false);
    }
  }

  const tabButton = (value: Tab) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === value}
      onClick={() => {
        setTab(value);
        setError(null);
      }}
      className={cn(
        "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        tab === value ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg",
      )}
    >
      {t(`dialog.${value}`)}
    </button>
  );

  return (
    <>
      <Button variant="ghost" size="sm" icon={<EditNote />} onClick={() => setOpen(true)}>
        {t("dialog.open")}
      </Button>
      {open && (
        <Modal closeModal={close} title={t("dialog.title", { name: animalName })} styles="max-w-xl">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div role="tablist" className="flex gap-1 rounded-lg bg-surface-sunken p-1">
              {tabButton("description")}
              {tabButton("image")}
            </div>

            {tab === "description" ? (
              <Field label={t("fields.description")} hint={t("germanHint")}>
                <Textarea
                  rows={10}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={saving}
                />
              </Field>
            ) : (
              <LexiconImagePicker
                file={file}
                onFileChange={setFile}
                consent={consent}
                onConsentChange={setConsent}
                disabled={saving}
              />
            )}

            <p className="text-xs text-fg-subtle">{t("reviewHint")}</p>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button type="submit" loading={saving}>
                {t("submit")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
