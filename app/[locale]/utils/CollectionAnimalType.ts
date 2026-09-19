import type { Tables } from "@/utils/supabase/database.types";

/**
 * A row of the `user_spotted_animals` view enriched with the signed storage
 * URLs for the user's own photo of that animal. Returned by
 * getCollectionAnimals and getLastSpottedAnimals, and consumed by the
 * collection grid and the homepage slider.
 *
 * Every column of the view is nullable because Postgres cannot prove
 * otherwise, but a row with no id or name cannot be rendered at all, so those
 * rows are dropped in the actions and the two fields are non-null here.
 */
type CollectionAnimal = Pick<
  Tables<"user_spotted_animals">,
  "image" | "first_spotted_at"
> & {
  id: number;
  common_name: string;
  signedUrls: {
    collection: string;
    collectionModal: string;
  };
};

export default CollectionAnimal;
