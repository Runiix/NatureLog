"use client";

import { ThumbUp } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { countColor } from "../listsmap/filterLists";
import type { MapAnimals, MapMarker } from "../listsmap/types";

const MAX_THUMBNAILS = 5;

/**
 * Content of a list marker's popup. Leaflet renders popups on its own white
 * panel, so this uses fixed light-surface colours rather than theme tokens.
 * The profile link used to be relative ("profilepage/…") and resolved
 * against the map URL.
 */
export default function MapPopup({ marker, animals }: { marker: MapMarker; animals: MapAnimals }) {
  const t = useTranslations("Map");
  const tLex = useTranslations("Lexicon");
  const listUrl = `/animallistspage/${marker.username}?listId=${marker.id}`;

  const listAnimals = marker.animal_ids.flatMap((id) => (animals[id] ? [animals[id]] : []));
  const withImage = listAnimals.filter((animal) => animal.lexicon_link);
  const shown = withImage.slice(0, MAX_THUMBNAILS);
  const hidden = listAnimals.length - shown.length;

  const categoryCounts = new Map<string, number>();
  for (const animal of listAnimals) {
    if (animal.category) categoryCounts.set(animal.category, (categoryCounts.get(animal.category) ?? 0) + 1);
  }
  const categories = [...categoryCounts].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex min-w-52 max-w-64 flex-col gap-2 font-sans text-slate-900">
      <div className="flex items-start justify-between gap-3">
        <Link href={listUrl} className="text-base font-semibold !text-green-700 hover:underline">
          {marker.title || t("untitled")}
        </Link>
        <span className="flex shrink-0 items-center gap-1 text-sm text-slate-600">
          <ThumbUp sx={{ fontSize: 14 }} aria-hidden />
          {marker.upvotes}
        </span>
      </div>
      {marker.description && <p className="!m-0 line-clamp-3 text-sm text-slate-600">{marker.description}</p>}
      <p className="!m-0 flex items-center gap-1.5 text-xs text-slate-500">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: countColor(marker.entry_count) }}
        />
        <span>
          {t("entries", { count: marker.entry_count })} ·{" "}
          <Link href={`/profilepage/${marker.username}`} className="!text-slate-700 hover:underline">
            {t("by", { name: marker.username })}
          </Link>
        </span>
      </p>
      {shown.length > 0 && (
        <ul className="!m-0 flex list-none items-center !p-0">
          {shown.map((animal) => (
            <li key={animal.id} className="-mr-1.5">
              <Link href={`/animalpage/${animal.common_name}`} title={animal.common_name}>
                <Image
                  src={animal.lexicon_link!}
                  alt={animal.common_name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                />
              </Link>
            </li>
          ))}
          {hidden > 0 && (
            <li className="ml-3 text-xs font-medium text-slate-500">{t("more", { count: hidden })}</li>
          )}
        </ul>
      )}
      {categories.length > 0 && (
        <ul className="!m-0 flex list-none flex-wrap gap-1 !p-0">
          {categories.map(([category, count]) => (
            <li key={category} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
              {tLex(category)} · {count}
            </li>
          ))}
        </ul>
      )}
      <Link
        href={listUrl}
        className="mt-1 rounded-md bg-green-700 px-3 py-1.5 text-center text-sm font-medium !text-white hover:bg-green-800"
      >
        {t("open")}
      </Link>
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
