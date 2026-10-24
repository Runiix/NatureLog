import { CameraAlt, Pets } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { SpeciesCard } from "../animals/SpeciesCard";
import { EmptyState } from "../ui/EmptyState";

export type CompareGridAnimal = {
  animalId: number;
  commonName: string;
  lexiconLink: string | null;
  myPhoto: boolean;
  theirPhoto: boolean;
};

/** Species cards for one compare tab, marked with who has photographed them. */
export default async function CompareGrid({
  animals,
  displayName,
  emptyText,
}: {
  animals: CompareGridAnimal[];
  displayName: string;
  emptyText: string;
}) {
  const t = await getTranslations("Compare");

  if (animals.length === 0) {
    return <EmptyState icon={<Pets />} title={t("emptyTitle")} description={emptyText} />;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {animals.map((animal) => {
        const photographers = [animal.myPhoto && t("you"), animal.theirPhoto && displayName].filter(Boolean);
        return (
          <li key={animal.animalId}>
            <SpeciesCard
              commonName={animal.commonName}
              lexiconLink={animal.lexiconLink}
              footer={
                photographers.length > 0 && (
                  <>
                    <CameraAlt sx={{ fontSize: 14 }} aria-hidden />
                    {t("photoBy", { names: photographers.join(" · ") })}
                  </>
                )
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
