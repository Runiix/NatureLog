"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { login, signup, type AuthErrorCode } from "@/app/[locale]/actions/auth/handleLogin";
import { isStrongPassword, isValidUsername, USERNAME_PATTERN } from "@/app/[locale]/utils/credentials";
import { createClient } from "@/utils/supabase/client";
import { Link } from "@/i18n/navigation";
import { Button } from "../ui/Button";
import { Field, Input } from "../ui/Field";
import { PasswordInput } from "./PasswordInput";

type Mode = "login" | "signup" | "reset";
type Notice = { tone: "error" | "success"; text: string } | null;

/**
 * Sign in, sign up and "forgot password" in one card. Errors are mapped from
 * codes to localised messages (the old form logged raw auth errors to the
 * console and showed German strings only), and every control is labelled.
 */
export default function AuthForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("login");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"username" | "password" | "terms", string>>>({});

  const switchTo = (next: Mode) => {
    setMode(next);
    setNotice(null);
    setFieldErrors({});
  };

  const errorText = (code: AuthErrorCode) => t(`errors.${code}`);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // currentTarget is null once an await has run; keep the element.
    const form = event.currentTarget;
    const formData = new FormData(form);
    setNotice(null);
    setFieldErrors({});

    if (mode === "signup") {
      const errors: typeof fieldErrors = {};
      if (!isValidUsername(formData.get("username"))) errors.username = t("errors.usernameInvalid");
      if (!isStrongPassword(formData.get("password"))) errors.password = t("errors.passwordWeak");
      if (formData.get("terms") !== "on") errors.terms = t("errors.termsRequired");
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setPending(true);
    try {
      if (mode === "login") {
        const result = await login(formData);
        // On success the action redirects and this never resolves with data.
        if (result?.error) setNotice({ tone: "error", text: errorText(result.error) });
      } else if (mode === "signup") {
        const result = await signup(formData);
        if ("error" in result) setNotice({ tone: "error", text: errorText(result.error) });
        else {
          setNotice({ tone: "success", text: t("signupSuccess") });
          form.reset();
        }
      } else {
        const email = String(formData.get("email") ?? "");
        const { error } = await createClient().auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/${locale}/passwordreset`,
        });
        // Same message either way, so the form does not reveal which
        // addresses have accounts.
        if (error) console.error("Password reset request failed", error.code);
        setNotice({ tone: "success", text: t("resetSent") });
      }
    } catch (error) {
      // Next's redirect() surfaces as a thrown control-flow error; let it through.
      if (error && typeof error === "object" && "digest" in error) throw error;
      setNotice({ tone: "error", text: t("errors.generic") });
    } finally {
      setPending(false);
    }
  }

  const title = mode === "login" ? t("loginTitle") : mode === "signup" ? t("signupTitle") : t("resetTitle");
  const subtitle =
    mode === "login" ? t("loginSubtitle") : mode === "signup" ? t("signupSubtitle") : t("resetSubtitle");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <Link
          href="/"
          className="mx-auto rounded-md text-2xl font-bold tracking-tight text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          NatureLog
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-fg-muted">{subtitle}</p>
      </header>

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={
            notice.tone === "error"
              ? "rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
              : "rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-text"
          }
        >
          {notice.text}
        </p>
      )}

      <form key={mode} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={mode === "signup"}>
        {mode === "signup" && (
          <Field label={t("username")} hint={t("usernameHint")} error={fieldErrors.username} required>
            <Input
              name="username"
              autoComplete="username"
              pattern={USERNAME_PATTERN.source}
              maxLength={30}
              autoFocus
            />
          </Field>
        )}
        <Field label={t("email")} required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus={mode !== "signup"}
          />
        </Field>
        {mode !== "reset" && (
          <Field
            label={t("password")}
            hint={mode === "signup" ? t("passwordHint") : undefined}
            error={fieldErrors.password}
            required
          >
            <PasswordInput
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
            />
          </Field>
        )}
        {mode === "login" && (
          <button
            type="button"
            onClick={() => switchTo("reset")}
            className="-mt-2 self-end rounded text-sm text-fg-muted hover:text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t("forgotPassword")}
          </button>
        )}
        {mode === "signup" && (
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-2 text-sm text-fg-muted">
              <input
                type="checkbox"
                name="terms"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[rgb(var(--color-accent))]"
                aria-invalid={fieldErrors.terms ? true : undefined}
              />
              <span>
                {t.rich("acceptTerms", {
                  terms: (chunks) => (
                    <Link href="/termsofservice" target="_blank" className="text-accent-text underline">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link href="/impressum" target="_blank" className="text-accent-text underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>
            {fieldErrors.terms && (
              <p role="alert" className="text-xs text-danger">
                {fieldErrors.terms}
              </p>
            )}
          </div>
        )}
        <Button type="submit" size="lg" fullWidth loading={pending}>
          {mode === "login" ? t("submitLogin") : mode === "signup" ? t("submitSignup") : t("submitReset")}
        </Button>
      </form>

      <p className="text-center text-sm text-fg-muted">
        {mode === "login" ? (
          <>
            {t("noAccount")}{" "}
            <button
              type="button"
              onClick={() => switchTo("signup")}
              className="rounded font-medium text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("toSignup")}
            </button>
          </>
        ) : (
          <>
            {mode === "signup" && `${t("haveAccount")} `}
            <button
              type="button"
              onClick={() => switchTo("login")}
              className="rounded font-medium text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t("toLogin")}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
