"use client";

import { BugReport, Check, Favorite, HeartBroken, Star } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SizeSlider } from "../../constants/constants";
import { cn } from "@/app/[locale]/utils/cn";
import {
  COLORS,
  ENDANGERMENT,
  GENERA,
  INVERTEBRATE_GROUPS,
  isInvertebrate,
  ORDERS_BY_GENUS,
  showsInvertebrates,
  SIZE_MAX,
  SIZE_MIN,
  VERTEBRATE_GROUPS,
} from "@/app/[locale]/utils/lexiconFilters";
import Switch from "../general/Switch";
import { useUrlFilters } from "./useUrlFilters";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-border-muted py-5 first:pt-0 last:border-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{title}</h3>
      {children}
    </section>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "border-accent bg-accent/10 font-medium text-accent-text"
          : "border-border-muted text-fg-muted hover:border-accent hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  id,
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="flex min-w-0 items-center gap-2 text-sm text-fg">
        <span aria-hidden className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
        <span className="flex flex-col">
          {label}
          {hint && <span className="text-xs text-fg-subtle">{hint}</span>}
        </span>
      </label>
      <Switch id={id} value={value} onChange={onChange} />
    </div>
  );
}

const INVERTEBRATE_ORDERS = INVERTEBRATE_GROUPS.flatMap((genus) => ORDERS_BY_GENUS[genus] ?? []);

export default function LexiconFilter({
  user,
  hideInvertebratesByDefault,
}: {
  user: User | null;
  hideInvertebratesByDefault: boolean;
}) {
  const t = useTranslations("Lexicon");
  const filters = useUrlFilters();
  const selectedGenera = filters.list("genus");
  const [size, setSize] = useState<number[]>(() => [
    Number(filters.searchParams.get("sizeFrom")) || SIZE_MIN,
    Number(filters.searchParams.get("sizeTo")) || SIZE_MAX,
  ]);

  const commitSize = (value: number[]) => {
    const full = value[0] === SIZE_MIN && value[1] === SIZE_MAX;
    filters.set({
      sizeFrom: full ? null : String(value[0]),
      sizeTo: full ? null : String(value[1]),
    });
  };

  const toggleFlag = (key: string) => filters.set({ [key]: filters.flag(key) ? null : "true" });

  const invertebratesShown = showsInvertebrates(
    filters.searchParams.get("invertebrates"),
    hideInvertebratesByDefault,
  );
  const toggleInvertebrates = () => {
    const show = !invertebratesShown;
    const keepGenera = selectedGenera.filter((genus) => show || !isInvertebrate(genus));
    const keepOrders = filters.list("order").filter((order) => show || !INVERTEBRATE_ORDERS.includes(order));
    filters.set({
      // Matching the setting needs no URL value, so "reset" lands there too.
      invertebrates: show === !hideInvertebratesByDefault ? null : show ? "show" : "hide",
      // Hidden groups cannot stay selected.
      genus: keepGenera.join(",") || null,
      order: keepOrders.join(",") || null,
    });
  };

  const visibleOrders = selectedGenera.flatMap((genus) =>
    (ORDERS_BY_GENUS[genus] ?? []).map((order) => ({ genus, order })),
  );

  return (
    <div className={cn("flex flex-col transition-opacity", filters.isPending && "opacity-70")}>
      <Section title={t("sections.mine")}>
        {user && (
          <>
            <ToggleRow
              id="filter-unseen"
              icon={<HeartBroken className="text-danger" />}
              label={t("onlyUnseenLabel")}
              value={filters.flag("onlyUnseen")}
              onChange={() => toggleFlag("onlyUnseen")}
            />
            <ToggleRow
              id="filter-seen"
              icon={<Favorite className="text-accent-text" />}
              label={t("onlySeenLabel")}
              value={filters.flag("onlySeen")}
              onChange={() => toggleFlag("onlySeen")}
            />
          </>
        )}
        <ToggleRow
          id="filter-rare"
          icon={<Star className="text-amber-500" />}
          label={t("rareLabel")}
          hint={t("rareHint")}
          value={filters.flag("excludeRares")}
          onChange={() => toggleFlag("excludeRares")}
        />
      </Section>

      <Section title={t("sections.genus")}>
        <ToggleRow
          id="filter-invertebrates"
          icon={<BugReport className="text-fg-muted" />}
          label={t("invertebratesLabel")}
          hint={t("invertebratesHint")}
          value={invertebratesShown}
          onChange={toggleInvertebrates}
        />
        <div className="flex flex-wrap gap-2">
          {(invertebratesShown ? GENERA : VERTEBRATE_GROUPS).map((genus) => (
            <Chip
              key={genus}
              selected={filters.has("genus", genus)}
              onClick={() => filters.toggle("genus", genus)}
            >
              {t(genus)}
            </Chip>
          ))}
        </div>
      </Section>

      {visibleOrders.length > 0 && (
        <Section title={t("sections.order")}>
          <div className="flex flex-col gap-1">
            {visibleOrders.map(({ order }) => {
              const selected = filters.has("order", order);
              return (
                <button
                  key={order}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => filters.toggle("order", order)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    selected ? "bg-accent/10 font-medium text-accent-text" : "text-fg-muted hover:bg-surface-sunken hover:text-fg",
                  )}
                >
                  {order}
                  {selected && <Check fontSize="small" aria-hidden />}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title={t("sections.color")}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => {
            const selected = filters.has("color", color.value);
            return (
              <button
                key={color.value}
                type="button"
                aria-pressed={selected}
                aria-label={t(color.value)}
                title={t(color.value)}
                onClick={() => filters.toggle("color", color.value)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  color.swatch,
                  selected ? "scale-110 border-accent" : "border-border hover:scale-105",
                )}
              >
                {selected && (
                  <Check
                    fontSize="small"
                    aria-hidden
                    className={color.dark ? "text-white" : "text-black"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("sections.endangerment")}>
        <div className="flex flex-wrap gap-2">
          {ENDANGERMENT.map((status) => (
            <Chip
              key={status}
              selected={filters.has("endangerment", status)}
              onClick={() => filters.toggle("endangerment", status)}
            >
              {t(status)}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title={t("sections.size")}>
        <p className="text-sm tabular-nums text-fg-muted">
          {t("sizeValue", { from: size[0], to: size[1] })}
        </p>
        <div className="px-2">
          <SizeSlider
            getAriaLabel={(index) => (index === 0 ? t("sizeFrom") : t("sizeTo"))}
            value={size}
            onChange={(_, value) => setSize(value as number[])}
            onChangeCommitted={(_, value) => commitSize(value as number[])}
            valueLabelDisplay="auto"
            min={SIZE_MIN}
            max={SIZE_MAX}
          />
        </div>
      </Section>
    </div>
  );
}
