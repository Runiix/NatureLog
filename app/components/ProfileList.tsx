import ProfileListElement from "./ProfileListElement";

export default function ProfileList({ profiles }: any) {
  console.log(profiles);
  return (
    <div className="flex flex-col items-center text-center pt-32 gap-6">
      <h1 className="text-slate-900 text-2xl">Profile</h1>
      <div className="flex flex-col items-center gap-4">
        {profiles &&
          profiles.map((profile: any, index: number) => (
            <ProfileListElement
              key={profile.id}
              username={profile.display_name}
              profilepicture={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${profile.id}/ProfilePicture/ProfilePic.jpg`}
              profilelink={`/profilepage/${profile.display_name}`}
            />
          ))}
      </div>
    </div>
  );
}
