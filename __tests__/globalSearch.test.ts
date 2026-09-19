/**
 * @jest-environment node
 */
type Call = [method: string, ...args: unknown[]];

const calls: Call[] = [];
let signedIn = true;
const rows: Record<string, unknown[]> = {};

/** A PostgREST-style builder that records every call and resolves to `rows[table]`. */
function recorder(table: string) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "or", "ilike", "order", "limit", "in"]) {
    builder[method] = (...args: unknown[]) => {
      calls.push([`${table}.${method}`, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: unknown) => void) =>
    resolve({ data: rows[table] ?? [], error: null });
  return builder;
}

jest.mock("@/utils/supabase/server", () => ({
  createClient: () => Promise.resolve({ from: (table: string) => recorder(table) }),
}));
jest.mock("@/app/[locale]/utils/data", () => ({
  getUser: () => Promise.resolve(signedIn ? { id: "viewer-id" } : null),
}));

import globalSearch from "@/app/[locale]/actions/general/globalSearch";

const argsOf = (name: string) => calls.filter(([n]) => n === name).map(([, ...args]) => args);

beforeEach(() => {
  calls.length = 0;
  signedIn = true;
  for (const key of Object.keys(rows)) delete rows[key];
});

describe("globalSearch", () => {
  test("short terms do not query at all", async () => {
    expect(await globalSearch(" a ")).toEqual({ animals: [], users: [], lists: [] });
    expect(calls).toEqual([]);
  });

  test("signed-out visitors only search species", async () => {
    signedIn = false;
    rows.animals = [{ common_name: "Luchs", scientific_name: "Lynx lynx" }];
    const result = await globalSearch("luch");
    expect(result).toEqual({
      animals: [{ name: "Luchs", scientificName: "Lynx lynx" }],
      users: [],
      lists: [],
    });
    expect(calls.some(([name]) => !name.startsWith("animals."))).toBe(false);
  });

  test("user input cannot add PostgREST conditions or LIKE wildcards", async () => {
    await globalSearch('a%,id.gt.0),"x');
    const [[filter]] = argsOf("animals.or") as [[string]];
    // The whole term sits inside double quotes, with % escaped for LIKE.
    expect(filter).toBe(
      'common_name.ilike."%a\\\\%,id.gt.0),\\"x%",scientific_name.ilike."%a\\\\%,id.gt.0),\\"x%"',
    );
    expect(argsOf("users.ilike")).toEqual([["display_name", '%a\\%,id.gt.0),"x%']]);
  });

  test("lists are limited to public ones or the caller's own", async () => {
    rows.animallists = [
      { id: "l1", title: "Garten", user_id: "owner-1" },
      { id: "l2", title: null, user_id: "owner-1" },
    ];
    rows.users = [{ id: "owner-1", display_name: "anna" }];
    const result = await globalSearch("gar");
    expect(argsOf("animallists.or")).toEqual([["is_public.eq.true,user_id.eq.viewer-id"]]);
    // Untitled lists are dropped; owner names are resolved for the link.
    expect(result.lists).toEqual([{ id: "l1", title: "Garten", ownerName: "anna" }]);
  });
});
