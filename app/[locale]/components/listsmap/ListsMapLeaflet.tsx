"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import MapPopup from "../animallists/MapPopup";
import { pinHtml } from "./filterLists";
import type { MapAnimals, MapMarker } from "./types";

export type MapFocus = { id: string; nonce: number };

const iconCache = new Map<string, L.DivIcon>();

/** Pins are rebuilt only when their title, count or highlight changes. */
function pinIcon(title: string, count: number, highlighted: boolean) {
  const key = `${highlighted ? 1 : 0}|${count}|${title}`;
  let icon = iconCache.get(key);
  if (!icon) {
    // Zero-size anchor: the pill is positioned over the point by CSS, with its tail on the spot.
    icon = L.divIcon({
      html: pinHtml(title, count, highlighted),
      className: "list-pin-icon",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -34],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

function BoundsReporter({ onChange }: { onChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds()),
  });
  useEffect(() => {
    onChange(map.getBounds());
  }, [map, onChange]);
  return null;
}

/** Brings the focused list into view: zooms out of its cluster if needed, then opens its popup. */
function FocusController({
  focus,
  markers,
  cluster,
}: {
  focus: MapFocus | null;
  markers: React.RefObject<Map<string, L.Marker>>;
  cluster: React.RefObject<L.MarkerClusterGroup | null>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const marker = markers.current.get(focus.id);
    if (!marker) return;
    if (cluster.current?.hasLayer(marker)) {
      cluster.current.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 12));
      marker.openPopup();
    }
  }, [focus, map, markers, cluster]);
  return null;
}

export default function ListsMapLeaflet({
  lists,
  animals,
  height,
  highlightedId,
  focus,
  onBoundsChange,
}: {
  lists: MapMarker[];
  animals: MapAnimals;
  height: string;
  highlightedId: string | null;
  focus: MapFocus | null;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}) {
  const t = useTranslations("Map");
  const markerRefs = useRef(new Map<string, L.Marker>());
  const entryCounts = useRef(new WeakMap<L.Marker, number>());
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // Leaflet keeps the first iconCreateFunction it gets, so the translation is
  // read through a ref to follow locale changes.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const iconCreateFunction = useMemo(
    () => (cluster: L.MarkerCluster) => {
      const children = cluster.getAllChildMarkers();
      const animalsTotal = children.reduce(
        (sum, marker) => sum + (entryCounts.current.get(marker) ?? 0),
        0,
      );
      const size = children.length < 10 ? 48 : children.length < 50 ? 56 : 64;
      return L.divIcon({
        html:
          `<div class="list-cluster"><span class="list-cluster__lists">${children.length}</span>` +
          `<span class="list-cluster__animals">${tRef.current("clusterAnimals", { count: animalsTotal })}</span></div>`,
        className: "list-cluster-icon",
        iconSize: L.point(size, size),
      });
    },
    [],
  );

  // Cluster bubbles cache their icon; recompute totals when the visible set changes.
  useEffect(() => {
    clusterRef.current?.refreshClusters();
  }, [lists]);

  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      style={{ height, width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // OSM has no dark tiles; inverting and rotating the hue back keeps
        // water blue and parks green while matching the dark theme.
        className="dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.95)_contrast(0.9)]"
      />
      <BoundsReporter onChange={onBoundsChange} />
      <FocusController focus={focus} markers={markerRefs} cluster={clusterRef} />
      <MarkerClusterGroup
        ref={clusterRef}
        iconCreateFunction={iconCreateFunction}
        showCoverageOnHover={false}
        maxClusterRadius={60}
      >
        {lists.map((list) => (
          <Marker
            key={list.id}
            position={[list.lat, list.lng]}
            icon={pinIcon(list.title || t("untitled"), list.entry_count, list.id === highlightedId)}
            zIndexOffset={list.id === highlightedId ? 1000 : 0}
            ref={(marker) => {
              if (marker) {
                markerRefs.current.set(list.id, marker);
                entryCounts.current.set(marker, list.entry_count);
              } else {
                markerRefs.current.delete(list.id);
              }
            }}
          >
            <Popup>
              <MapPopup marker={list} animals={animals} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
