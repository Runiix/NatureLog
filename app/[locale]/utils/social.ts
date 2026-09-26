import type { TypedSupabaseClient } from "@/utils/supabase/types";

/**
 * Ids of the users `userId` follows.
 *
 * `follows.following_id` is a uuid, so these are strings — three pages used to
 * declare this list as `number[]`, which only went unnoticed because the client
 * was untyped.
 */
export async function getFollowingIds(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) {
    console.error("Error getting following ids", error);
    return [];
  }

  // follows.following_id is nullable in the schema, so drop the rows that
  // carry no target rather than propagating nulls into every `.in()` filter.
  return data
    .map((follow) => follow.following_id)
    .filter((id): id is string => id !== null);
}

/**
 * The followed users whose sightings may appear in a feed: those with a public
 * profile and those who follow back. Mirrors canViewProfile in visibility.ts.
 */
export function visibleFeedUsers(
  following: string[],
  publicRows: { user_id: string | null }[],
  followBackRows: { follower_id: string | null }[],
): string[] {
  const visible = new Set<string | null>([
    ...publicRows.map((row) => row.user_id),
    ...followBackRows.map((row) => row.follower_id),
  ]);
  return following.filter((id) => visible.has(id));
}
