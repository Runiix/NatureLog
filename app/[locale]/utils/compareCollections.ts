/**
 * Two collections side by side: what both users have, what only one of them
 * has, and who is closer to the next milestone. Pure, so the set maths is
 * unit-tested and the pages only gather the rows.
 */
import { tiered } from "./achievements";

/** One species in a collection and whether its owner has a photo of it. */
export type Owned = { animalId: number; hasPhoto: boolean };

export type Comparison = {
  both: number[];
  onlyMine: number[];
  onlyTheirs: number[];
  /** Species both users have photographed. */
  bothPhotographed: number[];
  /** Species the other user has a photo of and the viewer does not. */
  photoOnlyTheirs: number[];
};

export function compareCollections(mine: Owned[], theirs: Owned[]): Comparison {
  const myPhotos = new Map(mine.map((row) => [row.animalId, row.hasPhoto]));
  const theirPhotos = new Map(theirs.map((row) => [row.animalId, row.hasPhoto]));

  const both = [...myPhotos.keys()].filter((id) => theirPhotos.has(id));
  return {
    both,
    onlyMine: [...myPhotos.keys()].filter((id) => !theirPhotos.has(id)),
    onlyTheirs: [...theirPhotos.keys()].filter((id) => !myPhotos.has(id)),
    bothPhotographed: both.filter((id) => myPhotos.get(id) && theirPhotos.get(id)),
    photoOnlyTheirs: [...theirPhotos.keys()].filter((id) => theirPhotos.get(id) && !myPhotos.get(id)),
  };
}

export type Race = {
  mine: number;
  theirs: number;
  /** The next species milestone neither has reached yet, or null past diamond. */
  target: number | null;
};

/** Both users' species counts against the leader's next sightings tier. */
export function race(mine: number, theirs: number): Race {
  return { mine, theirs, target: tiered("sightings", Math.max(mine, theirs)).next?.target ?? null };
}
