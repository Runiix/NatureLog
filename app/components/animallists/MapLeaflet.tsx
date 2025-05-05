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
import Link from "next/link";
import { ThumbUp } from "@mui/icons-material";
import MarkerClusterGroup from "react-leaflet-cluster";

export default function MapLeaflet({
  onLocationSelect,
  markers,
  height,
  iconUrl,
}: {
  onLocationSelect?: (location: LatLng) => void;
  markers?: any[];
  height: string;
  iconUrl: string;
}) {
  const [position, setPosition] = useState<any>(null);

  const icon = new L.Icon({
    iconUrl: iconUrl,
    iconSize: [38, 38],
    iconAnchor: [12, 41],
  });
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect && onLocationSelect(e.latlng);
      },
    });
    return position ? <Marker position={position} icon={icon} /> : null;
  };

  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      style={{ height: height, width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationPicker />
      <MarkerClusterGroup>
        {markers &&
          markers.map((marker, i) => (
            <Marker key={i} position={[marker.lat, marker.lng]} icon={icon}>
              <Popup>
                <div className="bg-gray-900 rounded-lg  p-2 ">
                  <div>
                    <div className="pb-2 border-b border-gray-200 flex items-center text-gray-200">
                      <Link
                        href={`/animallistspage/${marker.username}/?listId=${marker.id}`}
                      >
                        <h3 className="text-gray-200 hover:text-green-600">
                          {" "}
                          {marker.title}
                        </h3>
                      </Link>
                      <div className="ml-auto mr-3 flex gap-1 items-center">
                        <h3 className="text-xl">{marker.upvotes}</h3>
                        <ThumbUp />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-200">
                        Einträge: {marker.entry_count}
                      </p>
                      <p className="text-gray-200 pb-2 border-b border-gray-200">
                        {marker.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <p className="text-gray-200">von: </p>
                      <Link href={`profilepage/${marker.username}`}>
                        <p className="text-gray-200  hover:underline hover:text-green-600">
                          {marker.username}
                        </p>
                      </Link>
                    </div>
                  </div>{" "}
                </div>

                <a
                  href="https://www.flaticon.com/free-icons/pin"
                  title="pin icons"
                  className="text-xs"
                >
                  Pin icons created by Freepik - Flaticon
                </a>
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
