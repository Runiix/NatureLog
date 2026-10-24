"use client";

import { AddAPhoto, Visibility } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import submitContestEntry from "@/app/[locale]/actions/contest/submitContestEntry";
import { appendLexiconImage } from "@/app/[locale]/utils/lexiconImage";
import Modal from "../general/Modal";
import LexiconImagePicker from "../lexicon/LexiconImagePicker";
import { Button, ButtonLink } from "../ui/Button";
import { useToast } from "../ui/Toast";

const ERRORS = [
  "failed",
  "consentMissing",
  "invalidImage",
  "closed",
  "notInCollection",
  "alreadyEntered",
  "imageRejected",
] as const;
type ErrorCode = (typeof ERRORS)[number];
const errorKey = (code: string | null): ErrorCode =>
  ERRORS.includes(code as ErrorCode) ? (code as ErrorCode) : "failed";

/**
 * The "enter your photo" button and dialog. Users who have not spotted the
 * species yet get a link to it instead: only collected species can be entered.
 */
export default function SubmitEntry({
  contestId,
  speciesName,
  inCollection,
}: {
  contestId: string;
  speciesName: string;
  inCollection: boolean;
}) {
  const t = useTranslations("Contest");
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!inCollection) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-fg-muted">{t("submit.notInCollection", { name: speciesName })}</p>
        <ButtonLink href={`/animalpage/${speciesName}`} variant="secondary" size="sm" icon={<Visibility />}>
          {t("submit.toSpecies")}
        </ButtonLink>
      </div>
    );
  }

  async function submit() {
    if (!file) return toast(t("errors.missingPhoto"), "error");
    if (!consent) return toast(t("errors.consentMissing"), "error");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("contestId", contestId);
      formData.append("license", "true");
      await appendLexiconImage(formData, file);
      const res = await submitContestEntry(formData);
      if (!res.success) {
        toast(t(`errors.${errorKey(res.error)}`), "error");
        return;
      }
      toast(res.data.pending ? t("toast.inReview") : t("toast.entered"));
      setOpen(false);
      setFile(null);
      setConsent(false);
      router.refresh();
    } catch (error) {
      console.error("Contest entry failed:", error);
      toast(t("errors.failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button icon={<AddAPhoto />} onClick={() => setOpen(true)}>
        {t("submit.open")}
      </Button>
      {open && (
        <Modal title={t("submit.title", { name: speciesName })} closeModal={() => !loading && setOpen(false)}>
          <p className="text-sm text-fg-muted">{t("submit.hint")}</p>
          <LexiconImagePicker
            file={file}
            onFileChange={setFile}
            consent={consent}
            onConsentChange={setConsent}
            consentLabel={t("submit.consent")}
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              {t("submit.cancel")}
            </Button>
            <Button onClick={() => void submit()} loading={loading} disabled={!file || !consent}>
              {t("submit.confirm")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
