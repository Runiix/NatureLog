"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L, { LatLng } from "leaflet";

function LocationPicker({
  position,
  icon,
  onSelect,
}: {
  position: LatLng | null;
  icon: L.Icon;
  onSelect: (location: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return position ? <Marker position={position} icon={icon} /> : null;
}

/**
 * Location picker for the list form: click the map to drop a pin. The public
 * lists map has its own component (listsmap/ListsMapLeaflet).
 */
export default function MapLeaflet({
  onLocationSelect,
  height,
  iconUrl,
  setMarker,
}: {
  onLocationSelect?: (location: LatLng) => void;
  height: string;
  iconUrl: string;
  setMarker: boolean;
}) {
  const [position, setPosition] = useState<LatLng | null>(null);

  const icon = new L.Icon({
    iconUrl,
    iconSize: [38, 38],
    iconAnchor: [12, 41],
  });
  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      style={{ height, width: "100%" }}
      className="max-h-[500px] sm:max-h-none z-40"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // OSM has no dark tiles; inverting and rotating the hue back keeps
        // water blue and parks green while matching the dark theme.
        className="dark:[filter:invert(1)_hue-rotate(180deg)_brightness(0.95)_contrast(0.9)]"
      />
      {setMarker && (
        <LocationPicker
          position={position}
          icon={icon}
          onSelect={(latlng) => {
            setPosition(latlng);
            onLocationSelect?.(latlng);
          }}
        />
      )}
    </MapContainer>
  );
}
