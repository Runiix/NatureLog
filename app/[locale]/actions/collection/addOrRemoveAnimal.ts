"use server";

import { revalidatePath } from "next/cache";
import requireAuth from "@/utils/supabase/requireAuth";

/** Pages that render a user's spotted state and must not show a stale one. */
function revalidateSpottedPages() {
  revalidatePath("/[locale]/collectionpage/[username]", "page");
  revalidatePath("/[locale]/profilepage/[username]", "page");
  revalidatePath("/[locale]/homepage", "page");
}

/**
 * Moves an animal into or out of the caller's collection.
 *
 * `isSpotted` is the state the client currently shows; the action sets the
 * opposite. It is idempotent against the database: adding an animal already
 * collected, or removing one that is not, changes nothing — so a double click
 * no longer writes two rows, and the denormalised spotted_count is only
 * touched when a row really changed. It used to increment even when the
 * insert failed, and revalidated whatever path the client sent.
 */
export async function addOrRemoveAnimals(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const animalId = Number(formData.get("animalId"));
  if (!Number.isInteger(animalId) || animalId <= 0) {
    return { success: false as const, error: "Invalid animal" };
  }
  const shouldBeSpotted = formData.get("isSpotted") !== "true";

  if (!shouldBeSpotted) {
    const { data: removed, error } = await supabase
      .from("spotted")
      .delete()
      .match({ user_id: user.id, animal_id: animalId })
      .select("id");
    if (error) {
      console.error("Error removing animal", error);
      return { success: false as const, error: error.message };
    }
    if (removed.length > 0) {
      const { error: rpcError } = await supabase.rpc("decrement_spotted_count", {
        p_user_id: user.id,
      });
      if (rpcError) console.error("Error decrementing spotted count", rpcError);
    }
  } else {
    const { data: existing, error: readError } = await supabase
      .from("spotted")
      .select("id")
      .match({ user_id: user.id, animal_id: animalId })
      .limit(1);
    if (readError) {
      console.error("Error reading spotted row", readError);
      return { success: false as const, error: readError.message };
    }
    if (existing.length === 0) {
      const { error } = await supabase
        .from("spotted")
        .insert({ user_id: user.id, animal_id: animalId });
      if (error) {
        console.error("Error inserting animal", error);
        return { success: false as const, error: error.message };
      }
      const { error: rpcError } = await supabase.rpc("increment_spotted_count", {
        p_user_id: user.id,
      });
      if (rpcError) console.error("Error incrementing spotted count", rpcError);
    }
  }

  revalidateSpottedPages();
  return { success: true as const, isSpotted: shouldBeSpotted ? "true" : "false" };
}
