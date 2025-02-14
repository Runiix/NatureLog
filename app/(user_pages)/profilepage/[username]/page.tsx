import Nav from "@/app/components/general/Nav";
import PictureGrid from "@/app/components/profile/Picturegrid";
import ProfileInfos from "@/app/components/profile/ProfileInfos";
import ProfilePicture from "@/app/components/profile/ProfilePicture";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};
const getParamUserId = async (supabase: SupabaseClient, username: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("display_name", username);
  if (error) console.error("Error fetching user id", error);
  if (data) return data[0];
  return [];
};
const getAnimalCount = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) console.error("Error fetching animal count", error);
  if (data) return data.length;
  return 0;
};
const getTeam = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("team_link")
    .eq("user_id", userId);
  if (error) console.error("Error fetching team", error);
  if (data && data.length < 1) {
    return [];
  }
  if (data) return data;
  return [];
};
const checkForProfilePic = async (supabase: SupabaseClient, user: User) => {
  const { data: listData, error: listError } = await supabase.storage
    .from("profiles")
    .list(user?.id + "/ProfilePicture/", {
      limit: 2,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
  if (listError) {
    console.error(listError);
    return false;
  }
  const filteredData = listData.filter(
    (item: any) => item.name !== ".emptyFolderPlaceholder"
  );
  if (filteredData.length === 0) {
    return false;
  }
  return true;
};

const getProfilePictureUrl = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const { data, error } = await supabase.storage
    .from("profiles")
    .createSignedUrl(`${userId}/ProfilePicture/ProfilePic.jpg`, 60);
  if (error) {
    return "";
  }
  return data.signedUrl;
};

export default async function profilepage(params: any) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const Userparams = await params.params;
  const paramUser = await getParamUserId(supabase, Userparams.username);
  const paramUserId = paramUser.id;
  if (user && user.id === paramUserId) {
    const profilePic = await checkForProfilePic(supabase, user);

    const profilePicUrl = await getProfilePictureUrl(supabase, user.id);
    const animalCount = await getAnimalCount(supabase, user.id);
    const teamLink = await getTeam(supabase, user.id);

    return (
      <div>
        <Nav user={user} />
        <div className="bg-gray-900 w-full lg:w-3/4 m-auto  rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10">
          <div className="flex flex-col items-center sm:items-baseline md:flex-row gap-10 mx-auto py-20 mt-20">
            <ProfilePicture
              userId={user.id}
              currUser={true}
              profilePic={profilePic}
              profilePicUrl={profilePicUrl}
            />
            <div className="flex flex-col gap-10">
              <div className="flex gap-10 sm:text-xl border-b-2 border-gray-950 pb-2">
                <div>{user.user_metadata.displayName}</div>
                <div>Mitgleid seit: {user.created_at.split("T")[0]}</div>
              </div>
              <ProfileInfos
                user={user}
                animalCount={animalCount}
                teamIcon={teamLink[0].team_link}
                currUser={true}
              />
            </div>
          </div>
          <PictureGrid user={user} currUser={true} />
        </div>
      </div>
    );
  } else {
    const profilePic = await checkForProfilePic(supabase, paramUser);

    const profilePicUrl = await getProfilePictureUrl(supabase, paramUserId);
    const animalCount = await getAnimalCount(supabase, paramUserId);
    const teamLink = await getTeam(supabase, paramUserId);

    return (
      <div>
        <Nav user={user} />
        <div className="bg-gray-900 w-full lg:w-3/4 m-auto  rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10">
          <div className="flex flex-col md:flex-row gap-10 mx-auto py-20 mt-20">
            <ProfilePicture
              userId={paramUserId}
              currUser={false}
              profilePic={profilePic}
              profilePicUrl={profilePicUrl}
            />
            <div className="flex flex-col gap-10">
              <div className="flex gap-10 text-xl border-b-2 border-gray-950 pb-2">
                <div>{paramUser.display_name}</div>
                <div>Mitgleid seit: {paramUser.joyndate}</div>
              </div>
              <ProfileInfos
                user={paramUser}
                animalCount={animalCount}
                teamIcon={teamLink[0].team_link}
                currUser={false}
              />
            </div>
          </div>
          <PictureGrid user={paramUser} currUser={false} />
        </div>
      </div>
    );
  }
}
