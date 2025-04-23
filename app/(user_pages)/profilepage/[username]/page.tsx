import PictureGrid from "@/app/components/profile/Picturegrid";
import ProfileInfos from "@/app/components/profile/ProfileInfos";
import ProfilePicture from "@/app/components/profile/ProfilePicture";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { getUser } from "@/app/utils/data";

const getParamUserId = async (supabase: SupabaseClient, username: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("display_name", username);
  if (error) console.error("Error fetching user id", error);
  if (data) {
    return data[0];
  }
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
    return null;
  }
  if (data) return data;
  return null;
};
const checkForProfilePic = async (supabase: SupabaseClient, userId: string) => {
  const { data: listData, error: listError } = await supabase
    .from("profiles")
    .select("profile_picture")
    .eq("user_id", userId);
  if (listError) console.error("Error fetching profile picture", listError);
  if (listData && listData.length > 0) {
    return listData[0].profile_picture;
  }
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
const getFavoriteAnimal = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("favorite_animal")
    .eq("user_id", userId);
  if (error) return "keins";
  if (data === undefined) return "keins";
  if (!data) return "keins";
  if (data.length === 0) return "keins";
  return data[0].favorite_animal;
};
const getInstaLink = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("insta_link")
    .eq("user_id", userId);
  if (error) return null;
  if (data === undefined) return null;
  if (!data) return null;
  if (data.length === 0) return null;
  return data[0].insta_link;
};

export default async function profilepage(params: any) {
  const supabase = await createClient();
  const Userparams = await params.params;
  const [user, paramUser] = await Promise.all([
    getUser(supabase),
    getParamUserId(supabase, Userparams.username),
  ]);
  if (user && user.id === paramUser.id) {
    const [
      profilePic,
      favoriteAnimal,
      profilePicUrl,
      animalCount,
      teamLink,
      instaLink,
    ] = await Promise.all([
      checkForProfilePic(supabase, user.id),
      getFavoriteAnimal(supabase, user.id),
      getProfilePictureUrl(supabase, user.id),
      getAnimalCount(supabase, user.id),
      getTeam(supabase, user.id),
      getInstaLink(supabase, user.id),
    ]);

    return (
      <>
        <div className="bg-gray-900 w-full lg:w-3/4 m-auto mt-20 rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10">
          <div className="flex flex-col items-center sm:items-baseline md:flex-row gap-10 mx-auto py-20 ">
            <ProfilePicture
              userId={user.id}
              currUser={true}
              profilePic={profilePic}
              profilePicUrl={profilePicUrl}
            />
            <div className="flex flex-col gap-10">
              <ProfileInfos
                user={user}
                animalCount={animalCount}
                teamIcon={teamLink ? teamLink[0].team_link : null}
                favoriteAnimal={favoriteAnimal}
                currUser={true}
                instaLink={instaLink}
              />
            </div>
          </div>
          <PictureGrid user={user} currUser={true} />
        </div>
      </>
    );
  } else {
    const [
      profilePic,
      favoriteAnimal,
      profilePicUrl,
      animalCount,
      teamLink,
      instaLink,
    ] = await Promise.all([
      checkForProfilePic(supabase, paramUser.id),
      getFavoriteAnimal(supabase, paramUser.id),
      getProfilePictureUrl(supabase, paramUser.id),
      getAnimalCount(supabase, paramUser.id),
      getTeam(supabase, paramUser.id),
      getInstaLink(supabase, paramUser.id),
    ]);

    return (
      <>
        <div className="bg-gray-900 w-full lg:w-3/4 m-auto  rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10">
          <div className="flex flex-col md:flex-row gap-10 mx-auto py-20 mt-20">
            <ProfilePicture
              userId={paramUser.id}
              currUser={false}
              profilePic={profilePic}
              profilePicUrl={profilePicUrl}
            />
            <div className="flex flex-col gap-10">
              <ProfileInfos
                user={paramUser}
                animalCount={animalCount}
                teamIcon={teamLink ? teamLink[0].team_link : null}
                favoriteAnimal={favoriteAnimal}
                currUser={false}
                instaLink={instaLink}
              />
            </div>
          </div>
          <PictureGrid user={paramUser} currUser={false} />
        </div>
      </>
    );
  }
}
