/**
 * @jest-environment node
 */
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { visibleFeedUsers } from "@/app/[locale]/utils/social";
import { validateListFields, MAX_LIST_TITLE } from "@/app/[locale]/utils/listValidation";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

type Follow = { follower_id: string; following_id: string };

/**
 * Just enough of the query builder for canViewProfile: profiles by user_id
 * (maybeSingle) and follows filtered by follower/following (limit).
 */
function fakeSupabase(opts: {
  profiles?: Record<string, { is_public: boolean }>;
  follows?: Follow[];
  failProfiles?: boolean;
}) {
  return {
    from(table: string) {
      const filters: Record<string, string> = {};
      const builder = {
        select: () => builder,
        eq(column: string, value: string) {
          filters[column] = value;
          return builder;
        },
        maybeSingle() {
          if (opts.failProfiles) {
            return Promise.resolve({ data: null, error: { message: "boom" } });
          }
          return Promise.resolve({ data: opts.profiles?.[filters.user_id] ?? null, error: null });
        },
        limit() {
          const rows = (opts.follows ?? []).filter(
            (f) =>
              f.follower_id === filters.follower_id &&
              f.following_id === filters.following_id,
          );
          return Promise.resolve({ data: table === "follows" ? rows : [], error: null });
        },
      };
      return builder;
    },
  } as unknown as TypedSupabaseClient;
}

describe("canViewProfile", () => {
  test("owner can always view", async () => {
    expect(await canViewProfile(fakeSupabase({}), "a", "a")).toBe(true);
  });

  test("public profile is viewable by anyone signed in", async () => {
    const db = fakeSupabase({ profiles: { b: { is_public: true } } });
    expect(await canViewProfile(db, "a", "b")).toBe(true);
  });

  test("private profile requires a mutual follow", async () => {
    const profiles = { b: { is_public: false } };
    const mutual: Follow[] = [
      { follower_id: "a", following_id: "b" },
      { follower_id: "b", following_id: "a" },
    ];
    expect(await canViewProfile(fakeSupabase({ profiles, follows: mutual }), "a", "b")).toBe(true);
    expect(
      await canViewProfile(fakeSupabase({ profiles, follows: [mutual[0]] }), "a", "b"),
    ).toBe(false);
    expect(await canViewProfile(fakeSupabase({ profiles }), "a", "b")).toBe(false);
  });

  test("a missing profile row or a failed query denies access", async () => {
    expect(await canViewProfile(fakeSupabase({}), "a", "b")).toBe(false);
    expect(await canViewProfile(fakeSupabase({ failProfiles: true }), "a", "b")).toBe(false);
  });

  test("missing ids deny access", async () => {
    expect(await canViewProfile(fakeSupabase({}), null, "b")).toBe(false);
    expect(await canViewProfile(fakeSupabase({}), "a", undefined)).toBe(false);
  });
});

describe("validateListFields", () => {
  const base = { title: " Garten ", description: " Vögel ", publicList: true };

  test("trims text and leaves location untouched when not supplied", () => {
    const result = validateListFields(base);
    expect(result).toEqual({
      success: true,
      error: null,
      data: { title: "Garten", description: "Vögel", is_public: true },
    });
  });

  test("keeps a valid location and clears an absent one", () => {
    expect(validateListFields({ ...base, lat: 52.5, lng: 13.4 }).data).toMatchObject({
      has_location: true,
      lat: 52.5,
      lng: 13.4,
    });
    expect(validateListFields({ ...base, lat: null, lng: null }).data).toMatchObject({
      has_location: false,
      lat: null,
      lng: null,
    });
  });

  test.each([
    [{ ...base, title: "   " }, "Title is required"],
    [{ ...base, title: "x".repeat(MAX_LIST_TITLE + 1) }, "Title is too long"],
    [{ ...base, lat: 91, lng: 0 }, "Invalid location"],
    [{ ...base, lat: Number.NaN, lng: 0 }, "Invalid location"],
    [{ ...base, publicList: "true" as unknown as boolean }, "Invalid visibility"],
  ])("rejects %#", (input, error) => {
    expect(validateListFields(input)).toMatchObject({ success: false, error });
  });
});

describe("visibleFeedUsers", () => {

  it("keeps public and mutual follows, drops one-sided follows of private users", () => {
    expect(
      visibleFeedUsers(
        ["public", "mutual", "private"],
        [{ user_id: "public" }],
        [{ follower_id: "mutual" }],
      ),
    ).toEqual(["public", "mutual"]);
  });

  it("shows nothing when the lookups return nothing", () => {
    expect(visibleFeedUsers(["private"], [], [])).toEqual([]);
  });
});
