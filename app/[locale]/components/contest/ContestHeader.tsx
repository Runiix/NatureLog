import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import black from "@/app/[locale]/assets/images/black.webp";
import type { ContestSummary } from "@/app/[locale]/utils/contest-queries";
import { contestTimeline } from "@/app/[locale]/utils/contestBracket";
import { Link } from "@/i18n/navigation";

/** The contest's species, its phase and when that phase ends. */
export default async function ContestHeader({
  contest,
  actions,
}: {
  contest: ContestSummary;
  actions?: React.ReactNode;
}) {
  const [t, format] = await Promise.all([getTranslations("Contest"), getFormatter()]);
  const { votingStart, votingEnd } = contestTimeline(contest.weekStart);
  const deadline =
    contest.status === "submission" ? votingStart : contest.status === "voting" ? votingEnd : null;
  const name = contest.animal?.commonName ?? t("unknownSpecies");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Link
        href={`/animalpage/${name}`}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-surface-sunken sm:w-48"
      >
        <Image
          src={contest.animal?.lexiconLink ?? black}
          alt=""
          fill
          sizes="(min-width: 640px) 12rem, 100vw"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">
          {t(`phase.${contest.status}`)}
        </p>
        <h2 lang="de" className="text-2xl font-semibold tracking-tight">
          {name}
        </h2>
        {contest.animal && <p className="text-sm italic text-fg-muted">{contest.animal.scientificName}</p>}
        {deadline && (
          <p className="text-sm text-fg-muted">
            {t(contest.status === "submission" ? "entriesUntil" : "votingUntil", {
              time: format.dateTime(deadline, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
            })}
          </p>
        )}
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
