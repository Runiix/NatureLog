"use client";

import MapWithNoSSR from "../animallists/Map";

type Props = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  entry_count: number;
  lat: number;
  lng: number;
  username: string;
};
export default function ClientWrapper({
  lists,
  setMarker,
}: {
  lists: Props[];
  setMarker: boolean;
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-2 m-2 border border-gray-200 shadow-lg shadow-black">
      {" "}
      <MapWithNoSSR
        height="700px"
        markers={lists}
        iconUrl="/icons/marker-icon.png"
        setMarker={setMarker}
      />
    </div>
  );
}
