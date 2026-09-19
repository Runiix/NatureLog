"use client";

import { cn } from "@/app/[locale]/utils/cn";

/** On/off toggle: a real <button role="switch">, keyboard-operable and announced. */
export default function Switch({
  value,
  onChange,
  label,
  id,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  /** Accessible name, when no visible <label htmlFor> points at `id`. */
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        value ? "bg-accent-solid" : "bg-border",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          value ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
