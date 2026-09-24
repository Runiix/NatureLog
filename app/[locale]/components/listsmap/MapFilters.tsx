"use client";

import { Close, ExpandMore, Search, Tune } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/app/[locale]/utils/cn";
import { GENERA } from "@/app/[locale]/utils/lexiconFilters";
import Modal from "../general/Modal";
import { Button } from "../ui/Button";
import {
  activeFilterCount,
  isDefaultFilters,
  MIN_ENTRY_OPTIONS,
  MIN_UPVOTE_OPTIONS,
  type AnimalOption,
  type MapFilters as Filters,
  type Since,
} from "./filterLists";

const MAX_SUGGESTIONS = 8;
const SEARCH_DEBOUNCE_MS = 250;

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface text-sm text-fg transition-colors placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass, "appearance-none pl-3 pr-9 font-medium")}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ExpandMore
          fontSize="small"
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
        />
      </span>
    </label>
  );
}

/** Search box with suggestions from the animals that occur in the lists on the map. */
function AnimalCombobox({
  options,
  selected,
  onSelect,
}: {
  options: AnimalOption[];
  selected: AnimalOption | null;
  onSelect: (id: number | null) => void;
}) {
  const t = useTranslations("Map");
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const suggestions = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return options.slice(0, MAX_SUGGESTIONS);
    return options
      .filter(
        (animal) =>
          animal.common_name.toLocaleLowerCase().includes(q) ||
          animal.scientific_name.toLocaleLowerCase().includes(q),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [options, query]);

  const choose = (animal: AnimalOption) => {
    onSelect(animal.id);
    setQuery("");
    setOpen(false);
  };

  if (selected) {
    return (
      <div className="flex h-10 items-center">
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-accent bg-accent/10 py-1 pl-3 pr-1 text-sm font-medium text-accent-text">
          <span className="truncate">{selected.common_name}</span>
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label={t("clearAnimal", { name: selected.common_name })}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Close sx={{ fontSize: 16 }} aria-hidden />
          </button>
        </span>
      </div>
    );
  }

  const showList = open && suggestions.length > 0;
  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listboxId}-${active}` : undefined}
        aria-label={t("animalLabel")}
        placeholder={t("animalPlaceholder")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (event.key === "Enter" && showList) {
            event.preventDefault();
            choose(suggestions[active]);
          } else if (event.key === "Escape" && showList) {
            // Close only the suggestions, not the filter dialog around them.
            event.stopPropagation();
            setOpen(false);
          }
        }}
        className={cn(inputClass, "px-3")}
      />
      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-72 overflow-auto rounded-lg border border-border-muted bg-surface py-1 shadow-raised"
        >
          {suggestions.map((animal, i) => (
            <li
              key={animal.id}
              id={`${listboxId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: the input's blur would close the list first.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(animal);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-sm",
                i === active ? "bg-accent/10" : "",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-fg">{animal.common_name}</span>
                <span className="block truncate text-xs italic text-fg-subtle">{animal.scientific_name}</span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-fg-muted">
                {t("animalListsCount", { count: animal.listCount })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type FilterProps = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  animalChoices: AnimalOption[];
};

/**
 * The filter bar. From `md` up it sits inline above the map; on phones it
 * would push the map below the fold, so it collapses into a button that opens
 * the same fields in a dialog. Filters apply live in both places.
 */
export default function MapFilters({ resultCount, ...props }: FilterProps & { resultCount: number }) {
  const t = useTranslations("Map");
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(props.filters);

  return (
    <>
      <div className="hidden rounded-xl border border-border-muted bg-surface p-4 shadow-card md:block">
        <FilterFields {...props} />
      </div>
      <Button
        variant="secondary"
        fullWidth
        icon={<Tune />}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="md:hidden"
      >
        {t("filtersButton")}
        {active > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-solid px-1.5 text-xs font-semibold text-accent-fg">
            {active}
          </span>
        )}
      </Button>
      {open && (
        <Modal title={t("filtersTitle")} closeModal={() => setOpen(false)}>
          <FilterFields {...props} />
          <Button fullWidth onClick={() => setOpen(false)}>
            {t("showResults", { count: resultCount })}
          </Button>
        </Modal>
      )}
    </>
  );
}

function FilterFields({ filters, onChange, onReset, animalChoices }: FilterProps) {
  const t = useTranslations("Map");
  const tLex = useTranslations("Lexicon");

  // Typing stays local and reaches the URL after a pause, so each keystroke
  // doesn't rewrite history and refilter every pin.
  const [text, setText] = useState(filters.q);
  const [lastExternalQ, setLastExternalQ] = useState(filters.q);
  if (filters.q !== lastExternalQ) {
    setLastExternalQ(filters.q);
    setText(filters.q);
  }
  useEffect(() => {
    if (text === filters.q) return;
    const timer = setTimeout(() => onChange({ q: text }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, filters.q, onChange]);

  const selectedAnimal = animalChoices.find((animal) => animal.id === filters.animal) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-fg-muted">{t("searchLabel")}</span>
          <span className="relative">
            <Search
              fontSize="small"
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <input
              type="search"
              value={text}
              maxLength={50}
              onChange={(event) => setText(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className={cn(inputClass, "pl-9 pr-3")}
            />
          </span>
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-fg-muted" aria-hidden>
            {t("animalLabel")}
          </span>
          <AnimalCombobox
            options={animalChoices}
            selected={selectedAnimal}
            onSelect={(id) => onChange({ animal: id })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <FilterSelect
          label={t("category")}
          value={filters.category ?? ""}
          onChange={(value) => onChange({ category: value || null })}
          options={[
            { value: "", label: t("allCategories") },
            ...GENERA.map((category) => ({ value: category, label: tLex(category) })),
          ]}
        />
        <FilterSelect
          label={t("minEntries")}
          value={String(filters.minEntries)}
          onChange={(value) => onChange({ minEntries: Number(value) })}
          options={[
            { value: "0", label: t("any") },
            ...MIN_ENTRY_OPTIONS.map((n) => ({ value: String(n), label: `≥ ${n}` })),
          ]}
        />
        <FilterSelect
          label={t("minUpvotes")}
          value={String(filters.minUpvotes)}
          onChange={(value) => onChange({ minUpvotes: Number(value) })}
          options={[
            { value: "0", label: t("any") },
            ...MIN_UPVOTE_OPTIONS.map((n) => ({ value: String(n), label: `≥ ${n}` })),
          ]}
        />
        <FilterSelect
          label={t("since")}
          value={filters.since}
          onChange={(value) => onChange({ since: value as Since })}
          options={[
            { value: "all", label: t("sinceAll") },
            { value: "30d", label: t("since30d") },
            { value: "1y", label: t("since1y") },
          ]}
        />
      </div>
      {!isDefaultFilters(filters) && (
        <div className="flex justify-end">
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setText("");
              onReset();
            }}
          >
            {t("reset")}
          </Button>
        </div>
      )}
    </div>
  );
}
