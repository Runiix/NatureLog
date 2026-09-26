"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { getFollowingIds, visibleFeedUsers } from "../../utils/social";
import type { Tables } from "@/utils/supabase/types";
import { pageRange } from "@/app/[locale]/utils/pageRange";

export type FeedEntry = Tables<"spotted"> & {
  common_name: string | null;
  username: string | null;
};

export default async function getFeed(
  offset: number,
  pageSize: number,
): Promise<FeedEntry[]> {
  const { supabase, user } = await requireAuth();

  // The follow list is derived server-side. It used to be a parameter, which
  // let a caller read any user's sightings by naming their id.
  const following = await getFollowingIds(supabase, user.id);
  if (following.length === 0) return [];

  // Following is one-sided, so it alone must not unlock a private profile.
  // Same rule as canViewProfile (utils/visibility.ts): public or mutual follow.
  // A failed query yields no rows, so an error never widens access.
  const [{ data: publicRows }, { data: followBackRows }] = await Promise.all([
    supabase.from("profiles").select("user_id").in("user_id", following).eq("is_public", true),
    supabase.from("follows").select("follower_id").in("follower_id", following).eq("following_id", user.id),
  ]);
  const visible = visibleFeedUsers(following, publicRows ?? [], followBackRows ?? []);
  if (visible.length === 0) return [];

  const { from, to } = pageRange(offset, pageSize);

  const { data: feed, error: feedError } = await supabase
    .from("spotted")
    .select("*")
    .in("user_id", visible)
    // Postgres sorts NULLs first in a descending order; without nullsFirst:
    // false every sighting that never had a photo sat above the real news.
    .order("image_updated_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (feedError) {
    console.error("Error getting FollowingFeed", feedError);
    return [];
  }

  const animalIds = feed
    .map((entry) => entry.animal_id)
    .filter((id): id is number => id !== null);
  const userIds = feed
    .map((entry) => entry.user_id)
    .filter((id): id is string => id !== null);

  const [{ data: userNames, error: userNameError }, { data: animalNames, error: animalNameError }] =
    await Promise.all([
      supabase.from("users").select("id, display_name").in("id", userIds),
      supabase.from("animals").select("id, common_name").in("id", animalIds),
    ]);

  if (userNameError) {
    console.error("Error getting Usernames", userNameError);
    return [];
  }
  if (animalNameError) {
    console.error("Error getting AnimalNameList", animalNameError);
    return [];
  }

  const userNameMap = new Map(userNames.map((row) => [row.id, row.display_name]));
  const animalMap = new Map(animalNames.map((row) => [row.id, row.common_name]));

  return feed.map((entry) => ({
    ...entry,
    common_name:
      entry.animal_id === null ? null : animalMap.get(entry.animal_id) ?? null,
    username:
      entry.user_id === null ? null : userNameMap.get(entry.user_id) ?? null,
  }));
}
