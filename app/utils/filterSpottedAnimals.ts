export default function filterSpottedAnimals(data: any, counts: number[]) {
  const spottedBirdCount = data.filter(
    (item: { category: string }) => item.category === "Vogel"
  ).length;
  const spottedMammalCount = data.filter(
    (item: { category: string }) => item.category === "Säugetier"
  ).length;
  const spottedAmphibiaCount = data.filter(
    (item: { category: string }) => item.category === "Amphibie"
  ).length;
  const spottedReptileCount = data.filter(
    (item: { category: string }) => item.category === "Reptil"
  ).length;
  const spottedInsectCount = data.filter(
    (item: { category: string }) => item.category === "Insekt"
  ).length;
  const spottedArachnoidCount = data.filter(
    (item: { category: string }) => item.category === "Arachnoid"
  ).length;

  return [
    {
      name: "Säugetiere",
      value: "Säugetier",
      spottedCount: spottedMammalCount,
      count: counts[0],
    },
    {
      name: "Vögel",
      value: "Vogel",
      spottedCount: spottedBirdCount,
      count: counts[1],
    },

    {
      name: "Reptilien",
      value: "Reptil",
      spottedCount: spottedReptileCount,
      count: counts[2],
    },
    {
      name: "Amphibien",
      value: "Amphibie",
      spottedCount: spottedAmphibiaCount,
      count: counts[3],
    },

    {
      name: "Insekten",
      value: "Insekt",
      spottedCount: spottedInsectCount,
      count: counts[4],
    },
    {
      name: "Spinnen",
      value: "Arachnoid",
      spottedCount: spottedArachnoidCount,
      count: counts[5],
    },
  ];
}
