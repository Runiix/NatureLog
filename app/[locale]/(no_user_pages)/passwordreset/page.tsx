"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import AuthShell from "../../components/auth/AuthShell";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { useToast } from "../../components/ui/Toast";
import { isStrongPassword } from "@/app/[locale]/utils/credentials";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Landing page of the reset email. Enforces the same password rules as sign-up
 * (it used to accept anything) and only reports success when Supabase did —
 * it used to navigate to the login page and say "changed" even on failure.
 */
export default function PasswordReset() {
  const t = useTranslations("Auth");
  const toast = useToast();
  const router = useRouter();
  const [error, setError] = useState<{ field: "password" | "confirm" | "form"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    setError(null);

    if (!isStrongPassword(password)) {
      setError({ field: "password", text: t("errors.passwordWeak") });
      return;
    }
    if (password !== confirm) {
      setError({ field: "confirm", text: t("errors.passwordMismatch") });
      return;
    }

    setPending(true);
    let updateError;
    try {
      ({ error: updateError } = await createClient().auth.updateUser({ password }));
    } finally {
      setPending(false);
    }
    if (updateError) {
      setError({
        field: "form",
        text:
          updateError.code === "session_not_found" || updateError.status === 401
            ? t("errors.resetLinkInvalid")
            : updateError.code === "weak_password"
              ? t("errors.passwordWeak")
              : t("errors.generic"),
      });
      return;
    }
    toast(t("passwordChanged"));
    router.replace("/loginpage");
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <header className="flex flex-col gap-1 text-center">
          <p className="text-2xl font-bold tracking-tight text-accent-text">NatureLog</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("newPasswordTitle")}</h1>
        </header>
        {error?.field === "form" && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error.text}
          </p>
        )}
        <Field
          label={t("password")}
          hint={t("passwordHint")}
          error={error?.field === "password" ? error.text : undefined}
          required
        >
          <PasswordInput name="password" autoComplete="new-password" required autoFocus />
        </Field>
        <Field
          label={t("confirmPassword")}
          error={error?.field === "confirm" ? error.text : undefined}
          required
        >
          <PasswordInput name="confirm" autoComplete="new-password" required />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {t("submitNewPassword")}
        </Button>
        <Link
          href="/loginpage"
          className="self-center rounded text-sm text-fg-muted hover:text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("toLogin")}
        </Link>
      </form>
    </AuthShell>
  );
}
