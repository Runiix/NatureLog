import FollowerModal from "@/app/components/social/FollowerModal";
import FollowFeed from "@/app/components/social/FollowFeed";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

const getFollowing = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) {
    console.error(error);
    return [];
  }
  const following = data.map((f) => f.following_id);
  return following;
};
const getFollowingSpottedList = async (
  supabase: SupabaseClient,
  followingList: string[]
) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("*")
    .in("user_id", followingList)
    .order("image_updated_at", { ascending: true });
};

export default async function socialpage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (user) {
    const following = await getFollowing(supabase, user.id);

    return (
      <div>
        <FollowerModal user={user} following={following} />
        <FollowFeed />
      </div>
    );
  }
}
