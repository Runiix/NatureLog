"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export default async function getCollectionAnimals(
  user: User,
  offset: number,
  pageSize: number,
  query: string,
  searchParams: Record<string, string>
) {
  const params = new URLSearchParams(searchParams as Record<string, string>);
  const genus = params.get("genus") || "all";
  const noImages = params.get("noImages") || "false";
  const supabase = await createClient();
  async function getSignedUrlForImage(userId: string, folder: string, fileName: string) {
  const { data, error } = await supabase.storage
    .from("profiles")
    .createSignedUrl(`${userId}/${folder}/${fileName}`, 60*60); // URL valid for 60 seconds
  if (error) {
    console.error("Failed to create signed URL", error);
    return "/iamges/black.webp"; // fallback or placeholder URL maybe
  }
  return data.signedUrl;
}
  if (noImages === "true") {
    const { data: spottedData, error } = await supabase
      .from("spotted")
      .select("animal_id, image, first_spotted_at")
      .eq("user_id", user.id)
      .is("image", false);
    if (error || spottedData === null) {
      console.error("Error getting spotted List", error);
      return [];
    }
    const spottedIds: number[] = spottedData.map(
      (animal: { animal_id: number }) => animal.animal_id
    );
    const from = offset * pageSize;
    const to = (offset + 1) * pageSize - 1;

    if (genus === "all") {
      const { data: animalData, error } = await supabase
        .from("animals")
        .select("*")
        .in("id", spottedIds)
        .order("common_name", { ascending: true })
        .ilike("common_name", `%${query}%`)
        .range(from, to);
      if (error) {
        throw new Error("Failed to fetch data");
      }
            const animalsWithSignedUrls = await Promise.all(
    animalData.map(async (animal) => {
      const safeName = animal.common_name.replace(/[äöüß\s]/g, "_") + ".jpg";

      // Generate signed URLs for these folders
      const collectionUrl = await getSignedUrlForImage(user.id, "Collection", safeName);
      const collectionModalUrl = await getSignedUrlForImage(user.id, "CollectionModals", safeName);
      // Add more folders if needed...

      return {
        ...animal,
        signedUrls: {
          collection: collectionUrl,
          collectionModal: collectionModalUrl,
        },
      };
    })) 
     revalidatePath;
    return [animalsWithSignedUrls, spottedData];
    } else {
      const { data: animalData, error } = await supabase
        .from("animals")
        .select("*")
        .in("id", spottedIds)
        .eq("category", genus)
        .order("common_name", { ascending: true })
        .ilike("common_name", `%${query}%`)
        .range(from, to);
      if (error) {
        throw new Error("Failed to fetch data");
      }      

            const animalsWithSignedUrls = await Promise.all(
    animalData.map(async (animal) => {
      const safeName = animal.common_name.replace(/[äöüß\s]/g, "_") + ".jpg";

      // Generate signed URLs for these folders
      const collectionUrl = await getSignedUrlForImage(user.id, "Collection", safeName);
      const collectionModalUrl = await getSignedUrlForImage(user.id, "CollectionModals", safeName);
      // Add more folders if needed...

      return {
        ...animal,
        signedUrls: {
          collection: collectionUrl,
          collectionModal: collectionModalUrl,
        },
      };
    })) 
     revalidatePath;
    return [animalsWithSignedUrls, spottedData];
    }
  } else {
    const { data: spottedData, error } = await supabase
      .from("spotted")
      .select("animal_id, image, first_spotted_at")
      .eq("user_id", user.id);
    if (error || spottedData === null) {
      console.error("Error getting spotted List", error);
      return [];
    }
    const spottedIds: number[] = spottedData.map(
      (animal: { animal_id: number }) => animal.animal_id
    );
    const from = offset * pageSize;
    const to = (offset + 1) * pageSize - 1;

    if (genus === "all") {
      const { data: animalData, error } = await supabase
        .from("animals")
        .select("*")
        .in("id", spottedIds)
        .order("common_name", { ascending: true })
        .ilike("common_name", `%${query}%`)
        .range(from, to);
      if (error) {
        throw new Error("Failed to fetch data");
      }    

      const animalsWithSignedUrls = await Promise.all(
    animalData.map(async (animal) => {
      const safeName = animal.common_name.replace(/[äöüß\s]/g, "_") + ".jpg";

      // Generate signed URLs for these folders
      const collectionUrl = await getSignedUrlForImage(user.id, "Collection", safeName);
      const collectionModalUrl = await getSignedUrlForImage(user.id, "CollectionModals", safeName);
      // Add more folders if needed...

      return {
        ...animal,
        signedUrls: {
          collection: collectionUrl,
          collectionModal: collectionModalUrl,
        },
      };
    })) 
     revalidatePath;
    return [animalsWithSignedUrls, spottedData];
    } else {
      const { data: animalData, error } = await supabase
        .from("animals")
        .select("*")
        .in("id", spottedIds)
        .eq("category", genus)
        .order("common_name", { ascending: true })
        .ilike("common_name", `%${query}%`)
        .range(from, to);
      if (error) {
        throw new Error("Failed to fetch data");
      }
            const animalsWithSignedUrls = await Promise.all(
    animalData.map(async (animal) => {
      const safeName = animal.common_name.replace(/[äöüß\s]/g, "_") + ".jpg";

      // Generate signed URLs for these folders
      const collectionUrl = await getSignedUrlForImage(user.id, "Collection", safeName);
      const collectionModalUrl = await getSignedUrlForImage(user.id, "CollectionModals", safeName);
      // Add more folders if needed...

      return {
        ...animal,
        signedUrls: {
          collection: collectionUrl,
          collectionModal: collectionModalUrl,
        },
      };
    })) 
     revalidatePath;
    return [animalsWithSignedUrls, spottedData];
    }
  }
}
