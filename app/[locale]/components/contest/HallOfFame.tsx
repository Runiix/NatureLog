import { EmojiEvents } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Winner } from "@/app/[locale]/utils/contest-queries";
import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";

/** Past winning photos, each linking to its contest. */
export default async function HallOfFame({ winners }: { winners: Winner[] }) {
  const t = await getTranslations("Contest");
  if (winners.length === 0) return null;

  return (
    <section aria-labelledby="contest-hall-of-fame" className="flex flex-col gap-4">
      <h2 id="contest-hall-of-fame" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <EmojiEvents className="text-amber-500" aria-hidden />
        {t("hallOfFame")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {winners.map((winner) => (
          <li key={winner.id}>
            <Card
              as={Link}
              href={`/contestpage/${winner.id}`}
              padding="none"
              interactive
              className="flex h-full flex-col overflow-hidden"
            >
              <span className="relative block aspect-[4/3] w-full bg-surface-sunken">
                {winner.entry.thumbUrl && (
                  <Image src={winner.entry.thumbUrl} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                )}
              </span>
              <span className="flex flex-col gap-0.5 p-3 text-sm">
                <span lang="de" className="truncate font-semibold">
                  {winner.animal?.commonName ?? t("unknownSpecies")}
                </span>
                <span className="truncate text-fg-muted">
                  {t("photoBy", { name: winner.entry.username ?? t("unknownUser") })}
                </span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
