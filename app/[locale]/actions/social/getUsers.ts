"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";

export type SocialUser = {
  id: string;
  displayName: string;
  spottedCount: number;
  hasAvatar: boolean;
  isFollowing: boolean;
};

export type SocialTab = "top" | "following" | "followers";

const LIMIT = 50;

/**
 * Users for the community page: top spotters, the caller's follows, or their
 * followers, optionally filtered by name.
 *
 * The caller is taken from the session — it used to be a parameter. Only the
 * columns the list shows are selected (it was `select("*")`), results are
 * capped (the top list returned every user), and avatar and follow state come
 * back with each row instead of being fetched per row from the browser.
 */
export default async function getUsers(tab: SocialTab, search: string): Promise<SocialUser[]> {
  const { supabase, user } = await requireAuth();
  const term = search.trim().slice(0, 50);

  let scope: string[] | null = null;
  if (tab === "following" || tab === "followers") {
    const { data, error } =
      tab === "following"
        ? await supabase.from("follows").select("id:following_id").eq("follower_id", user.id)
        : await supabase.from("follows").select("id:follower_id").eq("following_id", user.id);
    if (error) {
      console.error("Error loading follow list", error);
      return [];
    }
    scope = data.map((row) => row.id).filter((id): id is string => id !== null);
    if (scope.length === 0) return [];
  }

  let query = supabase
    .from("users_with_profiles")
    .select("id, display_name, spotted_count")
    .neq("id", user.id)
    .order("spotted_count", { ascending: false, nullsFirst: false })
    .limit(LIMIT);
  if (scope) query = query.in("id", scope);
  if (term) query = query.ilike("display_name", `%${escapeLike(term)}%`);

  const { data: rows, error } = await query;
  if (error) {
    console.error("Error loading users", error);
    return [];
  }
  const people = rows.filter(
    (row): row is typeof row & { id: string; display_name: string } =>
      row.id !== null && row.display_name !== null,
  );
  if (people.length === 0) return [];
  const ids = people.map((row) => row.id);

  const [{ data: avatars }, { data: follows }] = await Promise.all([
    supabase.from("profiles").select("user_id").in("user_id", ids).eq("profile_picture", true),
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", ids),
  ]);
  const withAvatar = new Set((avatars ?? []).map((row) => row.user_id));
  const followed = new Set((follows ?? []).map((row) => row.following_id));

  return people.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    spottedCount: row.spotted_count ?? 0,
    hasAvatar: withAvatar.has(row.id),
    isFollowing: followed.has(row.id),
  }));
}
