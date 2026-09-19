"use client";

import MapWithNoSSR from "../animallists/Map";
import type { MapMarker } from "../animallists/MapLeaflet";

export default function ClientWrapper({
  lists,
  setMarker,
}: {
  lists: MapMarker[];
  setMarker: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-muted bg-surface shadow-card">
      <MapWithNoSSR
        height="min(70svh, 700px)"
        markers={lists}
        iconUrl="/icons/marker-icon.png"
        setMarker={setMarker}
      />
    </div>
  );
}
