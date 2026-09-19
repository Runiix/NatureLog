"use client";

import { ExpandLess, ExpandMore, TravelExplore } from "@mui/icons-material";
import type { LatLngBounds } from "leaflet";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import {
  DEFAULT_FILTERS,
  animalOptions,
  countStepLabels,
  filterLists,
  isDefaultFilters,
  parseFilters,
  serializeFilters,
  type MapFilters as Filters,
} from "./filterLists";
import ListsSidePanel from "./ListsSidePanel";
import type { MapFocus } from "./ListsMapLeaflet";
import MapFilters from "./MapFilters";
import type { MapAnimals, MapMarker } from "./types";

const MAP_HEIGHT = "min(70svh, 700px)";

const ListsMapLeaflet = dynamic(() => import("./ListsMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div style={{ height: MAP_HEIGHT }}>
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  ),
});

function Legend() {
  const t = useTranslations("Map");
  const [open, setOpen] = useState(true);
  return (
    <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-border-muted bg-surface/95 text-xs text-fg shadow-card backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {t("legendTitle")}
        {open ? <ExpandMore sx={{ fontSize: 16 }} aria-hidden /> : <ExpandLess sx={{ fontSize: 16 }} aria-hidden />}
      </button>
      {open && (
        <ul className="flex flex-col gap-1 px-3 pb-2">
          {countStepLabels().map((step) => (
            <li key={step.label} className="flex items-center gap-2 tabular-nums">
              <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: step.color }} />
              {step.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The public lists map: filter bar, map with count-coloured pins, and a panel
 * of the lists in view. Filters live in the URL so a view can be shared; they
 * are written with history.replaceState, which Next keeps in sync with
 * useSearchParams without refetching the server page.
 */
export default function ListsMapExplorer({ lists, animals }: { lists: MapMarker[]; animals: MapAnimals }) {
  const t = useTranslations("Map");
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const writeFilters = useCallback((next: Filters) => {
    const query = serializeFilters(next).toString();
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, []);

  const updateFilters = useCallback(
    (patch: Partial<Filters>) => writeFilters({ ...filters, ...patch }),
    [filters, writeFilters],
  );
  const resetFilters = useCallback(() => writeFilters(DEFAULT_FILTERS), [writeFilters]);

  const filtered = useMemo(() => filterLists(lists, animals, filters), [lists, animals, filters]);
  const animalChoices = useMemo(() => animalOptions(lists, animals), [lists, animals]);
  const inView = useMemo(
    () => (bounds ? filtered.filter((list) => bounds.contains([list.lat, list.lng])) : filtered),
    [filtered, bounds],
  );
  const isFiltered = !isDefaultFilters(filters);

  return (
    <div className="flex flex-col gap-4">
      <MapFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        animalChoices={animalChoices}
        resultCount={filtered.length}
      />
      <p className="text-sm text-fg-muted" aria-live="polite">
        {t("results", { count: filtered.length, total: lists.length })}
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* isolate: keeps the legend's and overlay's z-index inside the map, below dialogs. */}
        <div className="relative isolate overflow-hidden rounded-xl border border-border-muted bg-surface shadow-card">
          <ListsMapLeaflet
            lists={filtered}
            animals={animals}
            height={MAP_HEIGHT}
            highlightedId={hoveredId}
            focus={focus}
            onBoundsChange={setBounds}
          />
          <Legend />
          {filtered.length === 0 && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-overlay/30 p-4">
              <EmptyState
                icon={<TravelExplore />}
                title={t("noResults")}
                className="border-solid bg-surface shadow-raised"
                action={isFiltered && <Button onClick={resetFilters}>{t("reset")}</Button>}
              />
            </div>
          )}
        </div>
        <ListsSidePanel
          lists={inView}
          highlightedId={hoveredId}
          onHover={setHoveredId}
          onSelect={(id) => setFocus({ id, nonce: Date.now() })}
          className="max-h-96 lg:max-h-[min(70svh,700px)]"
        />
      </div>
    </div>
  );
}
