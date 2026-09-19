import { useFormatter, useTranslations } from "next-intl";

export type SpottingStats = {
  total: number;
  thisMonth: number;
  thisYear: number;
  withPhoto: number;
};

/** Small tiles with the user's sighting totals, shown under the recent-sightings carousel. */
export default function SightingStats({ stats }: { stats: SpottingStats }) {
  const t = useTranslations("Home.recent.stats");
  const format = useFormatter();

  const tiles = [
    { key: "thisMonth", value: stats.thisMonth },
    { key: "thisYear", value: stats.thisYear },
    { key: "total", value: stats.total },
    { key: "withPhoto", value: stats.withPhoto },
  ] as const;

  return (
    <dl className="mt-auto grid grid-cols-2 gap-2">
      {tiles.map(({ key, value }) => (
        <div key={key} className="flex flex-col gap-0.5 rounded-lg bg-surface-sunken px-3 py-2">
          <dt className="text-xs text-fg-muted">{t(key)}</dt>
          <dd className="text-xl font-semibold tabular-nums">{format.number(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
