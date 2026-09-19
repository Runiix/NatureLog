"use client";

import { Email } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";

export const CONTACT_EMAIL = "naturelog.de@gmail.com";

/**
 * Composes the message in the visitor's mail app. The previous form had no
 * action or handler, so "Senden" only reloaded the page and the message was
 * lost.
 */
export default function ContactForm() {
  const t = useTranslations("Contact");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setError(t("required"));
      return;
    }
    setError(null);
    const subject = encodeURIComponent(t("subject", { name }));
    const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")} required>
          <Input name="name" autoComplete="name" maxLength={100} />
        </Field>
        <Field label={t("email")} required>
          <Input name="email" type="email" autoComplete="email" maxLength={200} />
        </Field>
      </div>
      <Field label={t("message")} hint={t("sendHint")} error={error ?? undefined} required>
        <Textarea name="message" rows={6} maxLength={4000} />
      </Field>
      <Button type="submit" icon={<Email />} className="self-start">
        {t("send")}
      </Button>
    </form>
  );
}
