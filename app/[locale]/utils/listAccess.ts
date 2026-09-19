import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { revalidatePath } from "next/cache";

/**
 * A list's contents are readable by its owner, or by anyone once it is public.
 * The read actions take a list id from the client, so without this check any
 * signed-in user could page through someone's private list by guessing ids.
 */
export async function canReadList(
  supabase: TypedSupabaseClient,
  viewerId: string,
  listId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("animallists")
    .select("user_id, is_public")
    .eq("id", listId)
    .maybeSingle();
  if (error) {
    console.error("Error reading list access", error);
    return false;
  }
  return !!data && (data.is_public || data.user_id === viewerId);
}

/**
 * Lists render on the lists page, the profile page and the map, all as server
 * components fed at render time — so a mutation has to invalidate them or the
 * UI keeps showing the old list (a deleted list used to stay on screen).
 */
export function revalidateListPages() {
  revalidatePath("/[locale]/animallistspage/[username]", "page");
  revalidatePath("/[locale]/animallistspage/map", "page");
  revalidatePath("/[locale]/profilepage/[username]", "page");
}
