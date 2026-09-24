import { parseCollectionSort } from "@/app/[locale]/utils/collectionSort";

describe("parseCollectionSort", () => {
  test("defaults to name, A–Z", () => {
    expect(parseCollectionSort(new URLSearchParams())).toEqual({ column: "common_name", ascending: true });
  });

  test("sorts by spotted date in either direction", () => {
    expect(parseCollectionSort(new URLSearchParams("sortBy=first_spotted_at&sortOrder=descending"))).toEqual({
      column: "first_spotted_at",
      ascending: false,
    });
    expect(parseCollectionSort(new URLSearchParams("sortBy=first_spotted_at"))).toEqual({
      column: "first_spotted_at",
      ascending: true,
    });
  });

  test("unknown columns fall back to the name", () => {
    expect(parseCollectionSort(new URLSearchParams("sortBy=user_id")).column).toBe("common_name");
  });
});
