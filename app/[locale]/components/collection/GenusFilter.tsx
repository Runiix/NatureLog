"use client";

import { useTranslations } from "next-intl";
import filterSpottedAnimals from "@/app/[locale]/utils/filterSpottedAnimals";
import ProgressFilter from "./ProgressFilter";

/**
 * Group filter with progress per group ("spotted / total"), bound to
 * `?genus=`.
 */
export default function GenusFilter({
  counts,
  categoryCounts,
  mobileAside,
}: {
  counts: Record<string, number>;
  categoryCounts: { category: string }[];
  mobileAside?: React.ReactNode;
}) {
  const t = useTranslations("Collection");
  const tLex = useTranslations("Lexicon");

  const option = (value: string, label: string, spotted: number, total: number) => ({
    value,
    label,
    detail: t("progress", { spotted, total }),
    ratio: total > 0 ? spotted / total : 0,
  });

  const options = [
    option("all", t("all"), categoryCounts.length, counts.all ?? 0),
    ...filterSpottedAnimals(categoryCounts, counts).map((genus) =>
      option(genus.value, tLex(genus.value), genus.spottedCount, genus.count),
    ),
  ];

  return (
    <ProgressFilter
      param="genus"
      label={t("filterLabel")}
      options={options}
      mobileAside={mobileAside}
    />
  );
}
