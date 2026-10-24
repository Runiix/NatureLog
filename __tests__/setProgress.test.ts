/**
 * @jest-environment node
 */
import { setProgress } from "@/app/[locale]/utils/setProgress";

const owned = (animalId: number, hasPhoto = false) => ({ animalId, hasPhoto });

describe("setProgress", () => {
  test("counts spotted and photographed species of the set only", () => {
    const result = setProgress([1, 2, 3, 4], [owned(1, true), owned(2), owned(9, true)]);
    expect(result).toEqual({ total: 4, spotted: 2, photographed: 1, complete: false, completePhotos: false });
  });

  test("a set is complete once every species is spotted, photo-complete once every one has a photo", () => {
    expect(setProgress([1, 2], [owned(1, true), owned(2)])).toMatchObject({
      complete: true,
      completePhotos: false,
    });
    expect(setProgress([1, 2], [owned(1, true), owned(2, true)])).toMatchObject({
      complete: true,
      completePhotos: true,
    });
  });

  test("an empty set is never complete", () => {
    expect(setProgress([], [owned(1, true)])).toMatchObject({ total: 0, complete: false, completePhotos: false });
  });

  test("duplicate set entries count once", () => {
    expect(setProgress([1, 1, 2], [owned(1)])).toMatchObject({ total: 2, spotted: 1 });
  });
});
