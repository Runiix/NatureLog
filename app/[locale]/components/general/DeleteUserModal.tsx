"use client";

import { DeleteForever } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import deleteUser from "@/app/[locale]/actions/auth/deleteUser";
import { useRouter } from "@/i18n/navigation";
import Modal from "./Modal";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Field";
import { useToast } from "../ui/Toast";

/** Account deletion, gated on typing the exact username. */
export default function DeleteUserModal({ user }: { user: User }) {
  const t = useTranslations("Settings");
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = user.user_metadata.displayName as string;

  async function confirm() {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteUser();
      if (res.success) {
        toast(t("deleted"));
        router.replace("/");
        router.refresh();
        return;
      }
      setError(t("deleteError"));
    } catch {
      setError(t("deleteError"));
    }
    setDeleting(false);
  }

  return (
    <>
      <Button variant="danger" icon={<DeleteForever />} onClick={() => setOpen(true)}>
        {t("deleteAccount")}
      </Button>
      {open && (
        <Modal
          title={t("deleteTitle")}
          closeModal={() => !deleting && setOpen(false)}
        >
          <p className="text-fg-muted">{t("deleteText")}</p>
          <Field label={t("deleteConfirmLabel", { name: username })} error={error ?? undefined}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
              {t("cancel")}
            </Button>
            <Button
              variant="danger"
              icon={<DeleteForever />}
              loading={deleting}
              disabled={input !== username}
              onClick={() => void confirm()}
            >
              {t("deleteSubmit")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
