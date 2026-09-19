/**
 * @jest-environment node
 */
type Call = [method: string, ...args: unknown[]];

const calls: Call[] = [];
let spottedIds: number[] = [];
let signedIn = true;

/** A PostgREST-style builder that records every call and resolves to []. */
function recorder(table: string) {
  const builder: Record<string, unknown> = {};
  const methods = ["select", "in", "not", "or", "neq", "gt", "lt", "ilike", "order", "eq", "range"];
  for (const method of methods) {
    builder[method] = (...args: unknown[]) => {
      calls.push([`${table}.${method}`, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: unknown) => void) =>
    resolve({
      data: table === "spotted" ? spottedIds.map((animal_id) => ({ animal_id })) : [],
      error: null,
    });
  return builder;
}

jest.mock("@/utils/supabase/server", () => ({
  createClient: () => Promise.resolve({ from: (table: string) => recorder(table) }),
}));
jest.mock("@/app/[locale]/utils/data", () => ({
  getUser: () => Promise.resolve(signedIn ? { id: "viewer" } : null),
}));

import getAnimals from "@/app/[locale]/actions/lexicon/getAnimals";

const animalCalls = (method: string) =>
  calls.filter(([name]) => name === `animals.${method}`).map(([, ...args]) => args);

beforeEach(() => {
  calls.length = 0;
  spottedIds = [];
  signedIn = true;
});

describe("getAnimals sanitises URL filters", () => {
  test("unknown sort columns fall back to the name", async () => {
    await getAnimals({ sortBy: "password_hash" }, 0, 20);
    expect(animalCalls("order")[0]).toEqual(["common_name", { ascending: true }]);
  });

  test("conservation sort uses the ordinal column", async () => {
    await getAnimals({ sortBy: "endangerment_status", sortOrder: "descending" }, 0, 20);
    expect(animalCalls("order")[0]).toEqual(["endangerment_order", { ascending: false }]);
  });

  test("colour values cannot inject extra PostgREST conditions", async () => {
    await getAnimals({ color: "red,id.gt.0),evil" }, 0, 20);
    expect(animalCalls("or")).toEqual([["colors.ilike.%red%"]]);
  });

  test("genus and order are restricted to known values", async () => {
    await getAnimals({ genus: "Vogel,Hacker", order: "Strigiformes – Eulen,DROP" }, 0, 20);
    expect(animalCalls("in")).toEqual([
      ["category", ["Vogel"]],
      ["taxonomic_order", ["Strigiformes – Eulen"]],
    ]);
  });

  test("search input is escaped and sizes must be numbers in range", async () => {
    await getAnimals({ query: "50%_", sizeFrom: "abc", sizeTo: "9999" }, 0, 20);
    expect(animalCalls("ilike")).toEqual([["common_name", "%50\\%\\_%"]]);
    expect(animalCalls("gt")).toEqual([]);
    expect(animalCalls("lt")).toEqual([]);
  });

  test("page size is capped and offsets cannot go negative", async () => {
    await getAnimals({}, -5, 10_000);
    expect(animalCalls("range")).toEqual([[0, 49]]);
  });

  test("seen/unseen use the viewer's spotted ids from the server", async () => {
    spottedIds = [3, 7];
    await getAnimals({ onlyUnseen: "true" }, 0, 20);
    expect(animalCalls("not")).toEqual([["id", "in", "(3,7)"]]);

    calls.length = 0;
    spottedIds = [];
    await getAnimals({ onlyUnseen: "true" }, 0, 20);
    expect(animalCalls("not")).toEqual([]); // no malformed "in ()"

    const result = await getAnimals({ onlySeen: "true" }, 0, 20);
    expect(result).toEqual([]); // nothing seen yet
  });

  test("seen filters are ignored when signed out", async () => {
    signedIn = false;
    await getAnimals({ onlySeen: "true" }, 0, 20);
    expect(calls.some(([name]) => name.startsWith("spotted."))).toBe(false);
    expect(animalCalls("in")).toEqual([]);
  });
});
