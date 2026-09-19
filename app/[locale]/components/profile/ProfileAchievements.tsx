import { CameraAlt, Category, Diamond, FormatListBulleted, Shield, Visibility } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import {
  achievementScore,
  TIERS,
  type Achievement,
  type Tier,
  type TieredAchievement,
} from "@/app/[locale]/utils/achievements";
import { cn } from "@/app/[locale]/utils/cn";

const ICONS: Record<Achievement["id"], React.ReactNode> = {
  sightings: <Visibility />,
  photos: <CameraAlt />,
  rare: <Diamond />,
  endangered: <Shield />,
  allGroups: <Category />,
  listMaker: <FormatListBulleted />,
};

/** Medal colours; literal class strings so Tailwind's scanner sees them. */
const TIER_STYLES: Record<Tier, { medal: string; pip: string; card: string; label: string }> = {
  bronze: {
    medal: "bg-gradient-to-br from-orange-300 to-amber-700 text-white",
    pip: "bg-amber-700",
    card: "border-amber-700/40",
    label: "text-amber-800 dark:text-amber-500",
  },
  silver: {
    medal: "bg-gradient-to-br from-slate-200 to-slate-500 text-white",
    pip: "bg-slate-400",
    card: "border-slate-400/60",
    label: "text-slate-600 dark:text-slate-300",
  },
  gold: {
    medal: "bg-gradient-to-br from-yellow-200 to-amber-500 text-amber-950",
    pip: "bg-amber-400",
    card: "border-amber-400/60",
    label: "text-amber-700 dark:text-amber-300",
  },
  platinum: {
    medal: "bg-gradient-to-br from-teal-100 to-cyan-600 text-white",
    pip: "bg-cyan-500",
    card: "border-cyan-500/50",
    label: "text-cyan-700 dark:text-cyan-300",
  },
  diamond: {
    medal: "bg-gradient-to-br from-sky-200 via-indigo-400 to-fuchsia-500 text-white",
    pip: "bg-indigo-500",
    card: "border-indigo-400/60",
    label: "text-indigo-700 dark:text-indigo-300",
  },
};

type T = Awaited<ReturnType<typeof getTranslations<"Profile.achievements">>>;

function Medal({ icon, className }: { icon: React.ReactNode; className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm [&_svg]:h-5 [&_svg]:w-5",
        className,
      )}
    >
      {icon}
    </span>
  );
}

function Progress({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <progress
        value={value}
        max={max}
        aria-label={label}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-surface-sunken [&::-webkit-progress-value]:bg-accent"
      />
      <span className="text-xs tabular-nums text-fg-subtle">
        {value}/{max}
      </span>
    </div>
  );
}

function TieredCard({ achievement, t }: { achievement: TieredAchievement; t: T }) {
  const { id, tier, count, next, tiersEarned } = achievement;
  const style = tier ? TIER_STYLES[tier] : null;
  const name = t(`${id}.name`);

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        style ? cn("bg-surface", style.card) : "border-border-muted bg-surface-sunken/60",
      )}
    >
      <Medal
        icon={ICONS[id]}
        className={style ? style.medal : "bg-surface-sunken text-fg-subtle"}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("font-semibold leading-snug", !tier && "text-fg-muted")}>{name}</p>
          <span
            className={cn(
              "shrink-0 text-xs font-semibold uppercase tracking-wide",
              style ? style.label : "text-fg-subtle",
            )}
          >
            {tier ? t(`tiers.${tier}`) : t("locked")}
          </span>
        </div>
        <p className="text-sm text-fg-muted">
          {next ? t(`${id}.text`, { count: next.target }) : t(`${id}.maxed`, { count })}
        </p>

        <ol
          aria-label={t("tierProgress", { earned: tiersEarned, total: TIERS.length })}
          className="mt-1.5 flex gap-1"
        >
          {TIERS.map((step, index) => (
            <li
              key={step}
              title={t(`tiers.${step}`)}
              className={cn(
                "h-2 flex-1 rounded-full",
                // bg-fg/15 rather than a surface token: visible on the card
                // in both themes.
                index < tiersEarned ? TIER_STYLES[step].pip : "bg-fg/15",
              )}
            >
              <span className="sr-only">
                {t(`tiers.${step}`)}: {index < tiersEarned ? t("earned") : t("locked")}
              </span>
            </li>
          ))}
        </ol>
        {next && (
          <p className="text-xs text-fg-subtle">
            {t("nextTier", { tier: t(`tiers.${next.tier}`), count, target: next.target })}
          </p>
        )}
      </div>
    </li>
  );
}

export default async function ProfileAchievements({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const t = await getTranslations("Profile.achievements");
  const { earned, total } = achievementScore(achievements);

  return (
    <section aria-labelledby="profile-achievements" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="profile-achievements" className="text-xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-fg-muted">{t("earnedCount", { earned, total })}</p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) =>
          achievement.kind === "tiered" ? (
            <TieredCard key={achievement.id} achievement={achievement} t={t} />
          ) : (
            <li
              key={achievement.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                achievement.earned
                  ? "border-accent/40 bg-surface"
                  : "border-border-muted bg-surface-sunken/60",
              )}
            >
              <Medal
                icon={ICONS[achievement.id]}
                className={
                  achievement.earned ? "bg-accent text-accent-fg" : "bg-surface-sunken text-fg-subtle"
                }
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className={cn("font-semibold leading-snug", !achievement.earned && "text-fg-muted")}>
                  {t(`${achievement.id}.name`)}
                  <span className="sr-only">
                    {" – "}
                    {achievement.earned ? t("earned") : t("locked")}
                  </span>
                </p>
                <p className="text-sm text-fg-muted">{t(`${achievement.id}.text`)}</p>
                {!achievement.earned && achievement.target > 1 && (
                  <Progress
                    label={t(`${achievement.id}.name`)}
                    value={achievement.progress}
                    max={achievement.target}
                  />
                )}
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
