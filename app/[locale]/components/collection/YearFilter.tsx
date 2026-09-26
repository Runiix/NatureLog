"use client";

import { useTranslations } from "next-intl";
import ProgressFilter from "./ProgressFilter";

/**
 * New species per year of first sighting, bound to `?year=`. Bars are relative
 * to the best year. Picking a year drops `?noDate=`, which would match nothing
 * alongside it.
 */
export default function YearFilter({
  yearCounts,
  total,
  mobileAside,
}: {
  /** Species first spotted per year, newest year first. */
  yearCounts: { year: string; count: number }[];
  /** All species in the collection, dated or not. */
  total: number;
  mobileAside?: React.ReactNode;
}) {
  const t = useTranslations("Collection");
  const best = Math.max(1, ...yearCounts.map((entry) => entry.count));

  const options = [
    { value: "all", label: t("all"), detail: t("speciesCount", { count: total }), ratio: 1 },
    ...yearCounts.map(({ year, count }) => ({
      value: year,
      label: year,
      detail: t("newSpecies", { count }),
      ratio: count / best,
    })),
  ];

  return (
    <ProgressFilter
      param="year"
      label={t("yearFilterLabel")}
      options={options}
      clears={["noDate"]}
      mobileAside={mobileAside}
    />
  );
}
