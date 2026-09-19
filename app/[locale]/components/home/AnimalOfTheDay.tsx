import { getTranslations } from "next-intl/server";
import Image from "next/image";
import black from "@/app/[locale]/assets/images/black.webp";
import { Link } from "@/i18n/navigation";
import { cn } from "@/app/[locale]/utils/cn";
import type { Tables } from "@/utils/supabase/types";

/** Conservation status → text colour, readable on both themes. */
const STATUS_TONE: Record<string, string> = {
  "Nicht gefährdet": "text-accent-text",
  Vorwarnliste: "text-amber-600 dark:text-amber-400",
  Gefährdet: "text-orange-600 dark:text-orange-400",
  "Stark gefährdet": "text-orange-700 dark:text-orange-300",
  "Vom Aussterben bedroht": "text-danger",
  Ausgestorben: "text-fg-subtle",
  "Extrem selten": "text-fg-muted",
};

/** A featured species: large photo with the name overlaid, linking to its page. */
export default async function AnimalOfTheDay({
  data,
  title,
  size = "md",
}: {
  data: Tables<"animals">;
  title: string;
  size?: "md" | "lg";
}) {
  const tLex = await getTranslations("Lexicon");
  const status = data.endangerment_status;

  return (
    <Link
      href={`/animalpage/${data.common_name}`}
      className="group relative block h-full min-h-56 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <Image
        src={data.lexicon_link ?? black}
        alt=""
        fill
        priority={size === "lg"}
        sizes={size === "lg" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 100vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white sm:p-5">
        <span className="self-start rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
          {title}
        </span>
        <h2 className={cn("font-semibold leading-tight", size === "lg" ? "text-2xl sm:text-3xl" : "text-xl")}>
          {data.common_name}
        </h2>
        <p className="truncate text-sm italic text-white/80">{data.scientific_name}</p>
        {status && (
          <span
            className={cn(
              "mt-1 self-start rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium",
              STATUS_TONE[status] ?? "text-fg",
            )}
          >
            {tLex.has(status) ? tLex(status) : status}
          </span>
        )}
      </div>
    </Link>
  );
}
