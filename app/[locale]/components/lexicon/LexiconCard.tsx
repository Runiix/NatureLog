"use client";

import { Star } from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import black from "@/app/[locale]/assets/images/black.webp";
import { Link } from "@/i18n/navigation";
import FavoriteFunctionality from "../general/FavoriteFunctionality";
import ListFunctionality from "../general/ListFunctionality";
import { Card } from "../ui/Card";

/**
 * One species in the lexicon grid. The whole title is a real link (the card
 * used to navigate via onClick on a div), and the secondary line follows the
 * active sort: size, conservation status, or the scientific name.
 */
export default function LexiconCard({
  id,
  common_name,
  scientific_name,
  endangerment_status,
  size_from,
  size_to,
  sortBy,
  very_rare,
  imageUrl,
  user,
  spottedList,
}: {
  id: number;
  common_name: string;
  scientific_name: string;
  population_estimate?: string | null;
  endangerment_status: string | null;
  size_from: number | null;
  size_to: number | null;
  sortBy: string | null;
  very_rare: boolean;
  imageUrl: string | null;
  user: User | null;
  spottedList: number[];
}) {
  const t = useTranslations("Lexicon");

  const detail =
    sortBy === "size_to" && size_from !== null && size_to !== null
      ? t("cardSize", { from: size_from, to: size_to })
      : sortBy === "endangerment_status" && endangerment_status
        ? t(endangerment_status)
        : scientific_name;

  return (
    <Card padding="none" className="group/card flex h-full flex-col overflow-hidden">
      <Link
        href={`/animalpage/${common_name}`}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-sunken"
      >
        <Image
          src={imageUrl ?? black}
          alt=""
          fill
          sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
        />
        {very_rare && (
          <span
            title={t("rareTooltip")}
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-amber-300 backdrop-blur"
          >
            <Star sx={{ fontSize: 14 }} aria-hidden />
            {t("rare")}
          </span>
        )}
      </Link>
      <div className="flex flex-1 items-start justify-between gap-2 p-3 sm:p-4">
        <div className="min-w-0">
          <Link
            href={`/animalpage/${common_name}`}
            className="block truncate rounded font-semibold text-fg hover:text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-lg"
          >
            {common_name}
          </Link>
          <p className="truncate text-xs italic text-fg-muted sm:text-sm">
            {detail}
            {very_rare && <span className="sr-only">, {t("rareTooltip")}</span>}
          </p>
        </div>
        {user && (
          <div className="-mr-1 -mt-1 flex shrink-0 items-center">
            <FavoriteFunctionality user={user} id={id} name={common_name} spottedList={spottedList} />
            <ListFunctionality user={user} id={id} />
          </div>
        )}
      </div>
    </Card>
  );
}
