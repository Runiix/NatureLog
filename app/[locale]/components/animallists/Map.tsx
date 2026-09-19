// components/Map.tsx
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/Skeleton";

const MapWithNoSSR = dynamic(() => import("./MapLeaflet"), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full rounded-none" />,
});

export default MapWithNoSSR;
