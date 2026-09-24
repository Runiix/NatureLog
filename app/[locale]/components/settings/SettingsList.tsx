"use client";

import changeHideInvertebrates from "@/app/[locale]/actions/profile/changeHideInvertebrates";
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

/**
 * A switch that flips at once and settles on the value the server stored.
 * `save` returns the stored value, or null when saving failed.
 */
function useServerToggle(initial: boolean, save: () => Promise<boolean | null>) {
  const t = useTranslations("Settings");
  const toast = useToast();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    const previous = value;
    setValue(!previous);
    try {
      const stored = await save();
      if (stored === null) {
        setValue(previous);
        toast(t("error"), "error");
      } else {
        setValue(stored);
        toast(t("saved"));
      }
    } catch {
      setValue(previous);
      toast(t("error"), "error");
    } finally {
      setSaving(false);
    }
  };

  return [value, () => void toggle()] as const;
}

export default function SettingsList({
  user,
  isPublic,
  hideInvertebrates,
}: {
  user: User;
  isPublic: boolean;
  hideInvertebrates: boolean;
}) {
  const t = useTranslations("Settings");
  // The server toggles its own stored value; trust what it returns.
  const [publicProfile, togglePublic] = useServerToggle(isPublic, async () => {
    const result = await changePublicProfile();
    return result.success ? (result.isPublic ?? null) : null;
  });
  const [invertebratesHidden, toggleInvertebrates] = useServerToggle(hideInvertebrates, async () => {
    const result = await changeHideInvertebrates();
    return result.success ? (result.hideInvertebrates ?? null) : null;
  });

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection title={t("privacy")}>
        <SettingsRow id="setting-public" label={t("publicProfile")} hint={t("publicProfileHint")}>
          <Switch id="setting-public" value={publicProfile} onChange={togglePublic} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t("display")}>
        <SettingsRow label={t("theme")} hint={t("themeHint")}>
          <ThemeToggle />
        </SettingsRow>
        <SettingsRow label={t("language")} hint={t("languageHint")}>
          <LanguageSwitcher />
        </SettingsRow>
        <SettingsRow
          id="setting-invertebrates"
          label={t("hideInvertebrates")}
          hint={t("hideInvertebratesHint")}
        >
          <Switch
            id="setting-invertebrates"
            value={invertebratesHidden}
            onChange={toggleInvertebrates}
          />
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
