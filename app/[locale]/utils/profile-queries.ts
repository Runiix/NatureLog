import type { TypedSupabaseClient } from "@/utils/supabase/types";
import {
  buildActivity,
  computeAchievements,
  type Achievement,
  type ActivityEvent,
} from "./achievements";
import { getListStats } from "./animalLists";
import { isInvertebrate } from "./lexiconFilters";

export type ProfileList = {
  id: string;
  title: string | null;
  description: string | null;
  upvotes: number;
  entry_count: number;
};

export type ProfileData = {
  hasProfilePicture: boolean;
  profilePictureUrl: string;
  favoriteAnimal: string | null;
  instaLink: string | null;
  teamIcon: string | null;
  /** Headline count; invertebrates are curated, so they are counted apart. */
  vertebrateCount: number;
  invertebrateCount: number;
  listsCount: number;
  lists: ProfileList[];
  achievements: Achievement[];
  activity: ActivityEvent[];
};

/**
 * Every sighting with the animal facts the badges need. One query feeds the
 * species count, the achievements and the timeline, so the count and the
 * badges can never disagree.
 */
const getSightings = async (supabase: TypedSupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select(
      "first_spotted_at, image, image_updated_at, animals(common_name, category, very_rare, endangerment_status)",
    )
    .eq("user_id", userId);
  if (error) {
    console.error("Error fetching sightings", error);
    return [];
  }
  return data;
};

const getPublicListsCount = async (
  supabase: TypedSupabaseClient,
  userId: string,
) => {
  const { count, error } = await supabase
    .from("animallists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_public", true);
  if (error) {
    console.error("Error counting animal lists", error);
    return 0;
  }
  return count ?? 0;
};

const getProfileRow = async (supabase: TypedSupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_picture, favorite_animal, insta_link, team_link")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) console.error("Error fetching profile", error);
  return data;
};

const getProfilePictureUrl = async (
  supabase: TypedSupabaseClient,
  userId: string,
) => {
  const { data, error } = await supabase.storage
    .from("profiles")
    .createSignedUrl(`${userId}/ProfilePicture/ProfilePic.jpg`, 60 * 60);
  return error ? "" : data.signedUrl;
};

const getPublicLists = async (
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<ProfileList[]> => {
  const { data, error } = await supabase
    .from("animallists")
    .select("id, title, description")
    .eq("user_id", userId)
    .eq("is_public", true)
    .limit(3);
  if (error) {
    console.error("Error getting animalLists", error);
    return [];
  }

  const stats = await getListStats(
    supabase,
    data.map((list) => list.id),
  );
  return data.map((list) => ({
    ...list,
    upvotes: stats.upvotes[list.id] ?? 0,
    entry_count: stats.entryCounts[list.id] ?? 0,
  }));
};

/**
 * Everything the profile page renders for one user, in a single call.
 *
 * The page used to declare ten module-level fetchers and then repeat the whole
 * sequence — including the upvote/entry tally — once for the owner branch and
 * once for the visitor branch. Both branches show the same data, so there is
 * one query path here and the caller only decides which affordances to render.
 */
export async function getProfileData(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<ProfileData> {
  const [profile, profilePictureUrl, sightings, listsCount, lists] =
    await Promise.all([
      getProfileRow(supabase, userId),
      getProfilePictureUrl(supabase, userId),
      getSightings(supabase, userId),
      getPublicListsCount(supabase, userId),
      getPublicLists(supabase, userId),
    ]);

  // A sighting whose animal row is gone cannot be named or classified.
  const known = sightings.flatMap((row) => (row.animals ? [{ ...row, animal: row.animals }] : []));

  return {
    hasProfilePicture: profile?.profile_picture ?? false,
    profilePictureUrl,
    // null rather than the old hard-coded German "keins": the UI localises it.
    favoriteAnimal: profile?.favorite_animal || null,
    instaLink: profile?.insta_link ?? null,
    teamIcon: profile?.team_link ?? null,
    vertebrateCount: known.filter((row) => !isInvertebrate(row.animal.category)).length,
    invertebrateCount: known.filter((row) => isInvertebrate(row.animal.category)).length,
    listsCount,
    lists,
    achievements: computeAchievements({
      sightings: known.map((row) => ({
        category: row.animal.category,
        veryRare: row.animal.very_rare,
        endangerment: row.animal.endangerment_status,
        hasPhoto: row.image === true,
      })),
      publicLists: listsCount,
    }),
    activity: buildActivity(
      known.map((row) => ({
        first_spotted_at: row.first_spotted_at,
        image: row.image,
        image_updated_at: row.image_updated_at,
        animal: row.animal.common_name,
      })),
    ),
  };
}
