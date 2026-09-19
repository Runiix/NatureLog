import type { TypedSupabaseClient } from "@/utils/supabase/types";

/**
 * Single source of truth for "may this viewer see that profile's content".
 *
 * A profile is viewable when the viewer owns it, when it is marked public, or
 * when viewer and target follow each other. Anything else — including a missing
 * profile row or a failed query — is not viewable, so a fault never widens
 * access.
 */
export async function canViewProfile(
  supabase: TypedSupabaseClient,
  viewerId: string | undefined | null,
  targetId: string | undefined | null,
): Promise<boolean> {
  if (!viewerId || !targetId) return false;
  if (viewerId === targetId) return true;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_public")
    .eq("user_id", targetId)
    .maybeSingle();

  if (error) {
    console.error("Error reading profile visibility", error);
    return false;
  }
  if (!profile) return false;
  if (profile.is_public) return true;

  const [{ data: targetFollowsViewer, error: error1 }, { data: viewerFollowsTarget, error: error2 }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", targetId)
        .eq("following_id", viewerId)
        .limit(1),
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", viewerId)
        .eq("following_id", targetId)
        .limit(1),
    ]);

  if (error1 || error2) {
    console.error("Error reading follow relationship", error1 ?? error2);
    return false;
  }

  return Boolean(targetFollowsViewer?.length && viewerFollowsTarget?.length);
}
