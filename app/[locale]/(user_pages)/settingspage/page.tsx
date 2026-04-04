import SettingsList from "@/app/[locale]/components/settings/SettingsList";
import { getUser } from "@/app/[locale]/utils/data";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

const getProfileIsPublic = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_public")
    .eq("user_id", userId);
  if (error) {
    console.error("Error getting public state");
  }
  if (!data || data.length === 0) {
    return false;
  }
  return data[0].is_public;
};

export default async function settingspage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return <div>Kein Benutzer</div>;
  const isPublic = await getProfileIsPublic(supabase, user.id);
  return (
    <div>
      <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto mt-8 shadow-lg shadow-gray-400 p-4 rounded-lg mb-10">
        <h2 className="text-green-600 text-center text-2xl xl:text-5xl">
          Einstellungen
        </h2>{" "}
      </div>
      <SettingsList user={user} isPublic={isPublic} />
    </div>
  );
}
