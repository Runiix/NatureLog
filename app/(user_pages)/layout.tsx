import { createClient } from "@/utils/supabase/server";
import Nav from "../components/general/Nav";
import { SupabaseClient } from "@supabase/supabase-js";
import "leaflet/dist/leaflet.css";
import { ReactNode } from "react";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

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
export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  let following = [];
  if (user) {
    following = await getFollowing(supabase, user.id);
  }
  return (
    <>
      <Nav user={user} following={following} />
      <main>{children}</main>
    </>
  );
}
