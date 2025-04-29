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

export default async function socialpage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (user) {
    const following = await getFollowing(supabase, user.id);
    return (
      <div className="w-full flex items-center">
        <FollowerModal user={user} following={following} />
        <FollowFeed following={following} />
      </div>
    );
  }
}
