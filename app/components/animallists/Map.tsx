// components/Map.tsx
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("./MapLeaflet"), {
  ssr: false,
  loading: () => <p>Karte wird geladen...</p>,
});

export default MapWithNoSSR;
