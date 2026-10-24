/**
 * @jest-environment node
 */
import { compareCollections, race, type Owned } from "@/app/[locale]/utils/compareCollections";

const owned = (animalId: number, hasPhoto = false): Owned => ({ animalId, hasPhoto });

describe("compareCollections", () => {
  test("splits species into both, only mine and only theirs", () => {
    const result = compareCollections([owned(1), owned(2), owned(3)], [owned(2), owned(3), owned(4)]);
    expect(result.both).toEqual([2, 3]);
    expect(result.onlyMine).toEqual([1]);
    expect(result.onlyTheirs).toEqual([4]);
  });

  test("photo overlap needs a photo on the right side", () => {
    const mine = [owned(1, true), owned(2, false), owned(3, true)];
    const theirs = [owned(1, true), owned(2, true), owned(3, false), owned(4, true), owned(5, false)];
    const result = compareCollections(mine, theirs);
    expect(result.bothPhotographed).toEqual([1]);
    // 2: seen by both, only they have a photo. 4: only they have it at all.
    expect(result.photoOnlyTheirs).toEqual([2, 4]);
  });

  test("empty collections compare to nothing", () => {
    expect(compareCollections([], [])).toEqual({
      both: [],
      onlyMine: [],
      onlyTheirs: [],
      bothPhotographed: [],
      photoOnlyTheirs: [],
    });
  });

  test("duplicate rows count once", () => {
    const result = compareCollections([owned(1), owned(1)], [owned(1)]);
    expect(result.both).toEqual([1]);
  });
});

describe("race", () => {
  test("targets the leader's next milestone", () => {
    expect(race(42, 57)).toEqual({ mine: 42, theirs: 57, target: 100 });
    expect(race(9, 3)).toEqual({ mine: 9, theirs: 3, target: 10 });
  });

  test("a milestone that is reached exactly moves on to the next one", () => {
    expect(race(50, 20).target).toBe(100);
  });

  test("no target once the leader is past diamond", () => {
    expect(race(400, 10).target).toBeNull();
  });
});
