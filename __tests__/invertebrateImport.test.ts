/**
 * @jest-environment node
 */
import { mapRoteListe, presenceTime } from "@/scripts/invertebrates/config";
import { parseCsv, toCsv } from "@/scripts/invertebrates/csv";

const months = (values: number[]) => Object.fromEntries(values.map((value, i) => [String(i + 1), value]));

describe("presenceTime", () => {
  test("reads the months with at least 10 % of the peak as one season", () => {
    expect(presenceTime(months([0, 0, 2, 30, 80, 100, 90, 60, 20, 5, 0, 0]))).toBe("April bis September");
  });

  test("handles seasons across the new year and all-year species", () => {
    expect(presenceTime(months([50, 60, 40, 5, 0, 0, 0, 0, 0, 20, 45, 70]))).toBe("Oktober bis März");
    expect(presenceTime(months([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]))).toBe("Ganzjährig");
    expect(presenceTime(months([0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0]))).toBe("Juli");
    expect(presenceTime({})).toBeNull();
  });
});

test("Rote Liste codes map onto lexicon statuses; unknown ones stay empty", () => {
  expect(mapRoteListe("V")).toBe("Vorwarnliste");
  expect(mapRoteListe("stark gefährdet")).toBe("Stark gefährdet");
  expect(mapRoteListe("G")).toBe("Gefährdet");
  expect(mapRoteListe("D")).toBeNull();
  expect(mapRoteListe("LC")).toBeNull();
  expect(mapRoteListe(null)).toBeNull();
});

test("CSV round-trips semicolons, quotes and line breaks", () => {
  const rows = [
    { name: "Tagpfauenauge", description: 'Häufig; "auffällig"\nim Garten' },
    { name: "Hainschnirkelschnecke", description: "" },
  ];
  expect(parseCsv(toCsv(["name", "description"], rows))).toEqual(rows);
});
