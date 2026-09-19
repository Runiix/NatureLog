"use client";

import changePublicProfile from "@/app/[locale]/actions/profile/changePublicProfile";
import Switch from "@/app/[locale]/components/general/Switch";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import DeleteUserModal from "../general/DeleteUserModal";
import LanguageSwitcher from "../general/LanguageSwitcher";
import { Card } from "../ui/Card";
import { ThemeToggle } from "../ui/theme/ThemeToggle";
import { useToast } from "../ui/Toast";

/** One setting: label and hint on the left, the control on the right. */
function SettingsRow({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-0.5">
        {id ? (
          <label htmlFor={id} className="font-medium text-fg">
            {label}
          </label>
        ) : (
          <span className="font-medium text-fg">{label}</span>
        )}
        {hint && <p className="text-sm text-fg-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">{title}</h2>
      <Card padding="lg" className="divide-y divide-border-muted">
        {children}
      </Card>
    </section>
  );
}

export default function SettingsList({ user, isPublic }: { user: User; isPublic: boolean }) {
  const t = useTranslations("Settings");
  const toast = useToast();
  const [publicProfile, setPublicProfile] = useState(isPublic);
  const [saving, setSaving] = useState(false);

  const togglePublic = async () => {
    if (saving) return;
    setSaving(true);
    const previous = publicProfile;
    setPublicProfile(!previous);
    try {
      const result = await changePublicProfile();
      if (result.success) {
        // The server toggles its own stored value; trust what it returns.
        setPublicProfile(result.isPublic ?? !previous);
        toast(t("saved"));
      } else {
        setPublicProfile(previous);
        toast(t("error"), "error");
      }
    } catch {
      setPublicProfile(previous);
      toast(t("error"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title={t("privacy")}>
        <SettingsRow id="setting-public" label={t("publicProfile")} hint={t("publicProfileHint")}>
          <Switch
            id="setting-public"
            value={publicProfile}
            onChange={() => void togglePublic()}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t("display")}>
        <SettingsRow label={t("theme")} hint={t("themeHint")}>
          <ThemeToggle />
        </SettingsRow>
        <SettingsRow label={t("language")} hint={t("languageHint")}>
          <LanguageSwitcher />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t("account")}>
        <SettingsRow label={t("deleteAccount")} hint={t("deleteAccountHint")}>
          <DeleteUserModal user={user} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
