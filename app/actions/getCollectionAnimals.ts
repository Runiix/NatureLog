"use server";

import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export default async function getCollectionAnimals(
  user: User,
  offset: number,
  pageSize: number,
  query: string,
  searchParams: Record<string, string>
) {
  const supabase = await createClient();
  const params = new URLSearchParams(searchParams);
  const genus = params.get("genus") || "all";
  const noImages = params.get("noImages") === "true";

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
      .eq("user_id", user.id)
      .ilike("common_name", `%${query}%`)
      .order("common_name", { ascending: true })
      .range(from, to);

    if (genus !== "all") {
      queryBuilder = queryBuilder.eq("category", genus);
    }

    if (noImages) {
      queryBuilder = queryBuilder.is("image", false);
    }

    const { data, error } = await queryBuilder;
    if (error || !data) {
      console.error("Error fetching spotted animals", error);
      return [];
    }

    return data;
  }

  // Helper: Attach image URLs
  async function withSignedUrls(animalData: any[]) {
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

        const safeName = animal.common_name.replace(/[äöüß\s]/g, "_") + ".jpg";
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
