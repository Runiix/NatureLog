"use client";

import { ThumbUp } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { MapMarker } from "./MapLeaflet";

/**
 * Content of a list marker's popup. Leaflet renders popups on its own white
 * panel, so this uses fixed light-surface colours rather than theme tokens.
 * The profile link used to be relative ("profilepage/…") and resolved
 * against the map URL.
 */
export default function MapPopup({ marker }: { marker: MapMarker }) {
  const t = useTranslations("Map");
  return (
    <div className="flex min-w-48 flex-col gap-1.5 font-sans text-slate-900">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/animallistspage/${marker.username}?listId=${marker.id}`}
          className="text-base font-semibold !text-green-700 hover:underline"
        >
          {marker.title || t("untitled")}
        </Link>
        <span className="flex shrink-0 items-center gap-1 text-sm text-slate-600">
          <ThumbUp sx={{ fontSize: 14 }} aria-hidden />
          {marker.upvotes}
        </span>
      </div>
      {marker.description && <p className="!m-0 line-clamp-3 text-sm text-slate-600">{marker.description}</p>}
      <p className="!m-0 text-xs text-slate-500">
        {t("entries", { count: marker.entry_count })} ·{" "}
        <Link href={`/profilepage/${marker.username}`} className="!text-slate-700 hover:underline">
          {t("by", { name: marker.username })}
        </Link>
      </p>
      <a
        href="https://www.flaticon.com/free-icons/pin"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] !text-slate-400"
      >
        {t("iconCredit")}
      </a>
    </div>
  );
}
