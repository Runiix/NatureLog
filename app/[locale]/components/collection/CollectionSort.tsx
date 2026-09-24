"use client";

import { useTranslations } from "next-intl";
import { COLLECTION_SORT_COLUMNS } from "@/app/[locale]/utils/collectionSort";
import SortControl from "../general/SortControl";

export default function CollectionSort() {
  const t = useTranslations("Collection.sort");
  return (
    <SortControl
      id="collection-sort"
      defaultColumn="common_name"
      options={COLLECTION_SORT_COLUMNS.map((column) => ({ value: column, label: t(column) }))}
      labels={{
        label: t("label"),
        toggleOrder: t("toggleOrder"),
        ascending: t("ascending"),
        descending: t("descending"),
      }}
    />
  );
}
