"use client";

import { Close } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import {
  ALL_ORDERS,
  COLOR_VALUES,
  ENDANGERMENT,
  FILTER_KEYS,
  GENERA,
  pickAllowed,
  showsInvertebrates,
} from "@/app/[locale]/utils/lexiconFilters";
import { useUrlFilters } from "./useUrlFilters";

type Chip = { key: string; value: string; label: string };

/** One chip per active filter in the URL, in a fixed order. */
function activeFilterChips(
  filters: ReturnType<typeof useUrlFilters>,
  hideInvertebratesByDefault: boolean,
  t: ReturnType<typeof useTranslations>,
) {
  const chips: Chip[] = [];
  // Only values the lexicon knows become chips — the URL is user input, and
  // translating an unknown value used to throw MISSING_MESSAGE.
  const allowed: Record<string, readonly string[]> = {
    genus: GENERA,
    order: ALL_ORDERS,
    color: COLOR_VALUES,
    endangerment: ENDANGERMENT,
  };
  for (const [key, values] of Object.entries(allowed)) {
    for (const value of pickAllowed(filters.searchParams.get(key), values)) {
      chips.push({ key, value, label: key === "order" ? value : t(value) });
    }
  }
  for (const key of ["onlySeen", "onlyUnseen", "excludeRares"] as const) {
    if (filters.flag(key)) {
      const label = key === "excludeRares" ? t("rareLabel") : t(`${key}Label`);
      chips.push({ key, value: "true", label });
    }
  }
  if (!showsInvertebrates(filters.searchParams.get("invertebrates"), hideInvertebratesByDefault)) {
    chips.push({ key: "invertebrates", value: "hide", label: t("invertebratesHidden") });
  }
  const sizeFrom = Number(filters.searchParams.get("sizeFrom")) || null;
  const sizeTo = Number(filters.searchParams.get("sizeTo")) || null;
  if (sizeFrom || sizeTo) {
    chips.push({
      key: "size",
      value: "",
      label: t("sizeValue", { from: sizeFrom ?? 0, to: sizeTo ?? 500 }),
    });
  }

  return chips;
}

/** Active filters as removable chips, plus "reset all". */
export default function LexiconFilterList({
  hideInvertebratesByDefault,
}: {
  hideInvertebratesByDefault: boolean;
}) {
  const t = useTranslations("Lexicon");
  const filters = useUrlFilters();

  const invertebratesParam = filters.searchParams.get("invertebrates");
  const chips = activeFilterChips(filters, hideInvertebratesByDefault, t);

  if (chips.length === 0) return null;
  // Hidden by the user's setting alone: nothing to reset.
  const onlyDefault = chips.length === 1 && chips[0].key === "invertebrates" && !invertebratesParam;

  const remove = (chip: Chip) => {
    if (chip.key === "size") filters.set({ sizeFrom: null, sizeTo: null });
    else if (chip.key === "invertebrates") filters.set({ invertebrates: hideInvertebratesByDefault ? "show" : null });
    else if (chip.value === "true") filters.set({ [chip.key]: null });
    else filters.toggle(chip.key, chip.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 py-0.5 pl-3 pr-1 text-sm text-accent-text"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => remove(chip)}
            aria-label={t("removeFilter", { label: chip.label })}
            className="flex rounded-full p-0.5 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Close sx={{ fontSize: 16 }} />
          </button>
        </span>
      ))}
      {!onlyDefault && (
        <button
          type="button"
          onClick={() => filters.clear(FILTER_KEYS)}
          className="rounded px-2 text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {t("resetFilters")}
        </button>
      )}
    </div>
  );
}
