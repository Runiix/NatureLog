"use client";

import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { cn } from "@/app/[locale]/utils/cn";
import { useTheme } from "./ThemeProvider";
import { THEMES, type Theme } from "./theme";

const ICONS: Record<Theme, React.ReactNode> = {
  light: <LightMode fontSize="small" />,
  dark: <DarkMode fontSize="small" />,
  system: <SettingsBrightness fontSize="small" />,
};

/** Three-way segmented control: light / dark / follow the system. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Settings");

  return (
    <div
      role="radiogroup"
      aria-label={t("theme")}
      className="inline-flex rounded-lg border border-border bg-surface-sunken p-1"
    >
      {THEMES.map((option) => {
        const selected = theme === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              selected
                ? "bg-surface text-fg shadow-sm"
                : "text-fg-muted hover:text-fg",
            )}
          >
            <span aria-hidden className="flex">
              {ICONS[option]}
            </span>
            {t(`themes.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
