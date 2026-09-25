"use server";

import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import requireAuth from "@/utils/supabase/requireAuth";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { parseCollectionSort } from "@/app/[locale]/utils/collectionSort";
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

export default async function getCollectionAnimals(
  ownerId: string,
  offset: number,
  pageSize: number,
  query: string,
  searchParams: Record<string, string>
) {
  const { supabase, user } = await requireAuth();

  // The collection belongs to ownerId, not to the caller, so the same
  // public/mutual-follow rule that guards the profile guards it here.
  if (!(await canViewProfile(supabase, user.id, ownerId))) return [];

  const params = new URLSearchParams(searchParams);
  const genus = params.get("genus") || "all";
  const noImages = params.get("noImages") === "true";
  const noDate = params.get("noDate") === "true";
  const year = params.get("year");
  const sort = parseCollectionSort(params);

  const from = offset * pageSize;
  const to = (offset + 1) * pageSize - 1;

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
    let queryBuilder = supabase
      .from("user_spotted_animals")
      .select("id, common_name, image, first_spotted_at")
      .eq("user_id", ownerId)
      .ilike("common_name", `%${escapeLike(query)}%`)
      // Undated sightings go last either way.
      .order(sort.column, { ascending: sort.ascending, nullsFirst: false });
    // Same-day sightings stay in a stable order across pages.
    if (sort.column !== "common_name") queryBuilder = queryBuilder.order("common_name", { ascending: true });
    queryBuilder = queryBuilder.order("id", { ascending: true }).range(from, to);

    if (genus !== "all") {
      queryBuilder = queryBuilder.eq("category", genus);
    }

    if (noImages) {
      queryBuilder = queryBuilder.is("image", false);
    }

    if (noDate) {
      queryBuilder = queryBuilder.is("first_spotted_at", null);
    } else if (year && /^\d{4}$/.test(year)) {
      queryBuilder = queryBuilder
        .gte("first_spotted_at", `${year}-01-01`)
        .lt("first_spotted_at", `${Number(year) + 1}-01-01`);
    }

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
        const collectionUrl = await getSignedUrlForImage(ownerId, "Collection", safeName);
        const collectionModalUrl = await getSignedUrlForImage(ownerId, "CollectionModals", safeName);

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
