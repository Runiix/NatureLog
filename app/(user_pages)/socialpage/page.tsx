import Search from "@/app/components/general/Search";
import SocialFilter from "@/app/components/social/SocialFilter";
import SocialList from "@/app/components/social/SocialList";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const getFollowing = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) throw error;
  const following = data.map((f) => f.following_id);
  return following;
};

export default async function socialpage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (user) {
    const following = await getFollowing(supabase, user.id);

    return (
      <div className="mt-16 flex flex-col items-center gap-10  rounded-lg  py-10">
        <SocialFilter />
        <Search placeholder="NatureLogger Suchen" />
        <SocialList user={user} following={following} />
      </div>
    );
  }
}
