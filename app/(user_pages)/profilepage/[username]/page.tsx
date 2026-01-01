import PictureGrid from "@/app/components/profile/Picturegrid";
import ProfileInfos from "@/app/components/profile/ProfileInfos";
import ProfilePicture from "@/app/components/profile/ProfilePicture";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { getUser } from "@/app/utils/data";
import ProfileAnimalLists from "@/app/components/profile/ProfileAnimalLists";

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
const getListsCount = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("animallists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_public", true);
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
    .createSignedUrl(`${userId}/ProfilePicture/ProfilePic.jpg`, 60 * 60);
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

const getAnimalLists = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from("animallists")
    .select("id, title, description")
    .eq("user_id", userId)
    .eq("is_public", true)
    .limit(3);
  if (error) {
    console.error("Error getting animalLists", error);
    return [];
  }
  return data;
};
const getUpvotes = async (supabase: SupabaseClient, listIds: string[]) => {
  const { data, error } = await supabase
    .from("listupvotes")
    .select("id, list_id")
    .in("list_id", listIds);
  if (error) {
    console.error("Error getting Upvotes", error);
    return [];
  }
  return data;
};
const getCounts = async (supabase: SupabaseClient, listIds: string[]) => {
  const { data, error } = await supabase
    .from("animallistitems")
    .select("id, list_id")
    .in("list_id", listIds);
  if (error) {
    console.error("Error getting Upvotes", error);
    return [];
  }
  return data;
};
const isViewable = async (
  supabase: SupabaseClient,
  paramId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_public")
    .eq("user_id", paramId);
  if (error) {
    console.error("Error getting is_public", error);
    return false;
  }
  if (data[0].is_public) {
    return true;
  } else {
    const { data: data1, error: error1 } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", paramId)
      .eq("following_id", userId);
    const { data: data2, error: error2 } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", paramId);
    if (error1 || error2) {
      console.error("Error", error);
      return false;
    }
    if (data1.length > 0 && data2.length > 0) {
      return true;
    }
  }
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
      listsCount,
      teamLink,
      instaLink,
      animalLists,
    ] = await Promise.all([
      checkForProfilePic(supabase, user.id),
      getFavoriteAnimal(supabase, user.id),
      getProfilePictureUrl(supabase, user.id),
      getAnimalCount(supabase, user.id),
      getListsCount(supabase, user.id),
      getTeam(supabase, user.id),
      getInstaLink(supabase, user.id),
      getAnimalLists(supabase, user.id),
    ]);
    const animalListIdList = animalLists.map((list) => list.id);
    const upvotes = await getUpvotes(supabase, animalListIdList);
    const counts = await getCounts(supabase, animalListIdList);
    const upvoteMap: { [id: string]: number } = {};
    upvotes.forEach((upvote) => {
      const listId = upvote.list_id;
      upvoteMap[listId] = (Number(upvoteMap[listId]) || 0) + 1;
    });
    const countMap: { [id: string]: number } = {};
    counts.forEach((count) => {
      const listId = count.list_id;
      countMap[listId] = (Number(countMap[listId]) || 0) + 1;
    });
    const animalListsWithCounts = animalLists.map((item) => ({
      ...item,
      upvotes: upvoteMap[item.id] || 0,
      entry_count: countMap[item.id] || 0,
    }));
    const username = user.user_metadata.displayName;
    return (
      <>
        <div className="border-gray-200 shadow-black shadow-lg bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 hover:border-green-600 border rounded-lg cursor-pointer w-full lg:w-3/4 m-auto    flex flex-col justify-center items-center pb-10 px-2">
          <div className="flex flex-col items-center sm:items-baseline md:flex-row gap-10 mx-auto py-10 md:py-20 ">
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
                listsCount={listsCount}
                teamIcon={teamLink ? teamLink[0].team_link : null}
                favoriteAnimal={favoriteAnimal}
                currUser={true}
                instaLink={instaLink}
              />
            </div>
          </div>
          <PictureGrid user={user} currUser={true} />
          <ProfileAnimalLists
            data={animalListsWithCounts}
            username={username}
          />
        </div>
      </>
    );
  } else if (user) {
    const [
      profilePic,
      favoriteAnimal,
      profilePicUrl,
      animalCount,
      listsCount,
      teamLink,
      instaLink,
      animalLists,
    ] = await Promise.all([
      checkForProfilePic(supabase, paramUser.id),
      getFavoriteAnimal(supabase, paramUser.id),
      getProfilePictureUrl(supabase, paramUser.id),
      getAnimalCount(supabase, paramUser.id),
      getListsCount(supabase, paramUser.id),
      getTeam(supabase, paramUser.id),
      getInstaLink(supabase, paramUser.id),
      getAnimalLists(supabase, paramUser.id),
    ]);
    const animalListIdList = animalLists.map((list) => list.id);
    const upvotes = await getUpvotes(supabase, animalListIdList);
    const counts = await getCounts(supabase, animalListIdList);
    const upvoteMap: { [id: string]: number } = {};
    upvotes.forEach((upvote) => {
      const listId = upvote.list_id;
      upvoteMap[listId] = (Number(upvoteMap[listId]) || 0) + 1;
    });
    const countMap: { [id: string]: number } = {};
    counts.forEach((count) => {
      const listId = count.list_id;
      countMap[listId] = (Number(countMap[listId]) || 0) + 1;
    });
    const animalListsWithCounts = animalLists.map((item) => ({
      ...item,
      upvotes: upvoteMap[item.id] || 0,
      entry_count: countMap[item.id] || 0,
    }));
    const username = paramUser.display_name;
    const viewable = await isViewable(supabase, paramUser.id, user.id);
    if (viewable) {
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
                  listsCount={listsCount}
                  teamIcon={teamLink ? teamLink[0].team_link : null}
                  favoriteAnimal={favoriteAnimal}
                  currUser={false}
                  instaLink={instaLink}
                />
              </div>
            </div>
            <PictureGrid user={paramUser} currUser={false} />
            <ProfileAnimalLists
              data={animalListsWithCounts}
              username={username}
            />
          </div>
        </>
      );
    } else {
      return (
        <div className="bg-gray-900 w-full lg:w-3/4 m-auto  rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10 mt-20">
          DAS PROFIL IST PRIVAT
        </div>
      );
    }
  }
}
