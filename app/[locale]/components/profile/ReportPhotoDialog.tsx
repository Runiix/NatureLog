"use client";

import { Flag } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import addReport from "@/app/[locale]/actions/general/addReport";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import { Field, Textarea } from "../ui/Field";
import { useToast } from "../ui/Toast";

/** Report someone else's photo. Replaces two hand-rolled popovers and alert(). */
export default function ReportPhotoDialog({
  ownerId,
  imageLink,
  onClose,
}: {
  /** Whose photo it is — addReport files the report against this user. */
  ownerId: string;
  imageLink: string;
  onClose: () => void;
}) {
  const t = useTranslations("Profile");
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    const res = await addReport(ownerId, imageLink, reason);
    setSending(false);
    if (res.success) {
      toast(t("toast.reported"));
      onClose();
    } else {
      toast(t("toast.error"), "error");
    }
  }

  return (
    <Modal title={t("reportPhotoTitle")} closeModal={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={t("reportReason")}>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("reportPlaceholder")}
            maxLength={1000}
            autoFocus
          />
        </Field>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="danger" icon={<Flag />} loading={sending}>
            {t("reportSubmit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
