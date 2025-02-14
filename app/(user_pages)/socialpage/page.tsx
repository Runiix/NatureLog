import Nav from "@/app/components/general/Nav";
import ProfileList from "@/app/components/general/ProfileList";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};

export default async function socialpage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  return (
    <div>
      <Nav user={user} />
      <ProfileList />
    </div>
  );
}
