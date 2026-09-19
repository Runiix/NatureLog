"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L, { LatLng } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import MapPopup from "./MapPopup";

export type MapMarker = {
  id: string;
  title: string | null;
  description: string | null;
  entry_count: number;
  lat: number;
  lng: number;
  username: string;
  upvotes: number;
};

export default function MapLeaflet({
  onLocationSelect,
  markers,
  height,
  iconUrl,
  setMarker,
}: {
  onLocationSelect?: (location: LatLng) => void;
  markers?: MapMarker[];
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
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect?.(e.latlng);
      },
    });
    return position ? <Marker position={position} icon={icon} /> : null;
  };

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
      {setMarker && <LocationPicker />}
      <MarkerClusterGroup>
        {markers &&
          markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon}>
              <Popup>
                <MapPopup marker={marker} />
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
