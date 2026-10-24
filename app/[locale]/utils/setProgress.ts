import type { Owned } from "./compareCollections";

export type SetProgress = {
  total: number;
  spotted: number;
  photographed: number;
  /** Every species of the set spotted. */
  complete: boolean;
  /** Every species of the set photographed. */
  completePhotos: boolean;
};

/** How much of a species set a collection covers, by sightings and by photos. */
export function setProgress(setAnimalIds: number[], owned: Owned[]): SetProgress {
  const photos = new Map(owned.map((row) => [row.animalId, row.hasPhoto]));
  const ids = [...new Set(setAnimalIds)];
  const spotted = ids.filter((id) => photos.has(id)).length;
  const photographed = ids.filter((id) => photos.get(id)).length;
  return {
    total: ids.length,
    spotted,
    photographed,
    complete: ids.length > 0 && spotted === ids.length,
    completePhotos: ids.length > 0 && photographed === ids.length,
  };
}
