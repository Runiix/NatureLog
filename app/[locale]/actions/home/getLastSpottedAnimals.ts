"use server";

import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import requireAuth from "@/utils/supabase/requireAuth";
import type { Tables } from "@/utils/supabase/types";

type SpottedAnimalRow = Pick<
  Tables<"user_spotted_animals">,
  "id" | "common_name" | "image" | "first_spotted_at"
>;

/** A row that has the id and name the UI needs to render it at all. */
type RenderableRow = SpottedAnimalRow & { id: number; common_name: string };

/** Drops rows the UI could not render, narrowing id and name in the process. */
function renderableRows(rows: SpottedAnimalRow[]): RenderableRow[] {
  return rows.flatMap((row) =>
    row.id !== null && row.common_name !== null
      ? [{ ...row, id: row.id, common_name: row.common_name }]
      : [],
  );
}

/**
 * The caller's ten most recently dated sightings with signed photo URLs.
 * The user comes from the session; it used to be a parameter.
 */
export default async function getLastSpottedAnimals() {
  const { supabase, user } = await requireAuth();

  async function getSignedUrlForImage(userId: string, folder: string, fileName: string) {
    const { data, error } = await supabase.storage
      .from("profiles")
      .createSignedUrl(`${userId}/${folder}/${fileName}`, 60 * 60);
    if (error || !data) {
      console.error("Failed to create signed URL", error);
      return "/images/black.webp";
    }
    return data.signedUrl;
  }

  async function fetchAnimals() {
    const queryBuilder = supabase
      .from("user_spotted_animals")
      .select("id, common_name, image, first_spotted_at")
      .eq("user_id", user.id)
      .not("first_spotted_at", "is", null)
      .order("first_spotted_at", { ascending: false })
      .limit(10)

    const { data, error } = await queryBuilder;
    if (error || !data) {
      console.error("Error fetching spotted animals", error);
      return [];
    }

    return renderableRows(data);
  }

  async function withSignedUrls(animalData: RenderableRow[]) {
    return await Promise.all(
      animalData.map(async (animal) => {
        if (animal.image === false) {
          return {
            ...animal,
            signedUrls: {
              collection: "/images/black.webp",
              collectionModal: "/images/black.webp",
            },
          };
        }

        const safeName = collectionImageName(animal.common_name);
        const collectionUrl = await getSignedUrlForImage(user.id, "Collection", safeName);
        const collectionModalUrl = await getSignedUrlForImage(user.id, "CollectionModals", safeName);

        return {
          ...animal,
          signedUrls: {
            collection: collectionUrl,
            collectionModal: collectionModalUrl,
          },
        };
      })
    );
  }

  const animalData = await fetchAnimals();
  return await withSignedUrls(animalData);
}
