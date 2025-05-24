import DeleteUserModal from "@/app/components/general/DeleteUserModal";
import Switch from "@/app/components/general/Switch";
import ChangePublicModal from "@/app/components/settings/ChangePublicModal";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";
import { Public, PublicOff } from "@mui/icons-material";
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
    <div className="m-20 ">
      {" "}
      <div>
        {isPublic ? (
          <div className="flex gap-1 items-center">
            <Public className="text-gray-900" />
            <p className="text-gray-900">
              Dein Profil und deine Sammlung sind öffentlich
            </p>
            <ChangePublicModal
              user={user}
              text="Möchtest du dein Profil und deine Sammlung wirklich privat Machen?"
              isPublic={isPublic}
            />
          </div>
        ) : (
          <div className="flex gap-1">
            <PublicOff className="text-gray-900" />
            <p className="text-gray-900">
              Dein Profil und deine Sammlung sind privat. <br /> Nur
              NatrueLogger denen du folgst und die dir auch folgen können dein
              Profil und deine Sammlung sehen.
            </p>
            <ChangePublicModal
              user={user}
              text="Möchtest du dein Profil und deine Sammlung wirklich öffentlich Machen?"
              isPublic={isPublic}
            />
          </div>
        )}
      </div>
      <DeleteUserModal user={user} />
    </div>
  );
}
