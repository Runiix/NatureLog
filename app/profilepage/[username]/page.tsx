import Nav from "@/app/components/Nav";
import PictureGrid from "@/app/components/Picturegrid";
import ProfileInfos from "@/app/components/ProfileInfos";
import ProfilePicture from "@/app/components/ProfilePicture";
import { createClient } from "@/utils/supabase/server";

const getUser = async (supabase: any) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("Error fetching user", error);
  return user;
};
const getAnimalCount = async (supabase: any, user: any) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", user.id);
  if (error) console.error("Error fetching animal count", error);
  return data.length;
};
const getTeam = async (supabase: any, user: any) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("team_link")
    .eq("user_id", user.id);
  if (error) console.error("Error fetching team", error);
  if (data[0] === undefined) {
    return "none";
  } else return data;
};

export default async function profilepage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const animalCount = await getAnimalCount(supabase, user);
  const teamLink = await getTeam(supabase, user);

  return (
    <div>
      <Nav user={user} />
      <div className="bg-gray-900 w-full lg:w-3/4 m-auto  rounded-lg shadow-xl shadow-slate-900 flex flex-col justify-center items-center pb-10">
        <div className="flex flex-col md:flex-row gap-10 mx-auto py-20 mt-20">
          <ProfilePicture user={user} />
          <div className="flex flex-col gap-10">
            <div className="flex gap-10 text-xl border-b-2 border-gray-950 pb-2">
              <div>{user.user_metadata.displayName}</div>
              <div>Mitgleid seit: {user.created_at.split("T")[0]}</div>
            </div>
            <ProfileInfos
              user={user}
              animalCount={animalCount}
              teamIcon={teamLink[0].team_link}
            />
          </div>
        </div>
        <PictureGrid user={user} />
      </div>
    </div>
  );
}
