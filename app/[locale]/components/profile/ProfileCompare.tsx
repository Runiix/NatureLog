import { CompareArrows } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import type { Comparison, Race } from "@/app/[locale]/utils/compareCollections";
import { ButtonLink } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { StatTile } from "./StatTile";

/**
 * The viewer's collection against the profile owner's: shared species, what
 * each has that the other lacks, and the race to the next milestone.
 */
export default async function ProfileCompare({
  displayName,
  comparison,
  race,
}: {
  displayName: string;
  comparison: Comparison;
  race: Race;
}) {
  const t = await getTranslations("Compare");
  const href = (tab: string) => `/comparepage/${displayName}?tab=${tab}`;

  return (
    <section aria-labelledby="profile-compare" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="profile-compare" className="text-xl font-semibold tracking-tight">
          {t("cardTitle", { name: displayName })}
        </h2>
        <ButtonLink href={href("theirs")} variant="ghost" size="sm" icon={<CompareArrows />}>
          {t("viewAll")}
        </ButtonLink>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label={t("both")}
          value={comparison.both.length}
          detail={t("bothPhotographed", { count: comparison.bothPhotographed.length })}
          href={href("both")}
        />
        <StatTile
          label={t("onlyTheirs", { name: displayName })}
          value={comparison.onlyTheirs.length}
          detail={t("photoTargets", { count: comparison.photoOnlyTheirs.length })}
          href={href("theirs")}
        />
        <StatTile label={t("onlyMine")} value={comparison.onlyMine.length} href={href("mine")} />
      </div>

      {race.target !== null && (
        <div className="flex flex-col gap-2 rounded-xl border border-border-muted bg-surface-raised px-4 py-3">
          <p className="text-sm font-medium">{t("raceTitle", { target: race.target })}</p>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
            <span className="text-fg-muted">{t("you")}</span>
            <ProgressBar label={t("raceYou", { target: race.target })} value={race.mine} max={race.target} />
            <span className="max-w-32 truncate text-fg-muted">{displayName}</span>
            <ProgressBar
              label={t("raceThem", { name: displayName, target: race.target })}
              value={race.theirs}
              max={race.target}
            />
          </div>
        </div>
      )}
    </section>
  );
}
