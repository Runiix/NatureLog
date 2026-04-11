import SocialFilter from "@/app/[locale]/components/social/SocialFilter";
import SocialList from "@/app/[locale]/components/social/SocialList";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function SocialPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

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
  const following = user ? await getFollowing(supabase, user.id) : [];
  return (
    <div className=" flex flex-col items-center gap-4 md:gap-10 pb-10">
      <SocialFilter />
      {user && <SocialList user={user} following={following} />}
    </div>
  );
}
