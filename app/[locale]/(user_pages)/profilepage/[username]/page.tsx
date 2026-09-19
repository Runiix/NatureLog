import { Groups, Lock } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import ProfileAchievements from "@/app/[locale]/components/profile/ProfileAchievements";
import ProfileActivity from "@/app/[locale]/components/profile/ProfileActivity";
import PictureGrid from "@/app/[locale]/components/profile/Picturegrid";
import ProfileAnimalLists from "@/app/[locale]/components/profile/ProfileAnimalLists";
import ProfileInfos from "@/app/[locale]/components/profile/ProfileInfos";
import ProfilePicture from "@/app/[locale]/components/profile/ProfilePicture";
import { ButtonLink } from "@/app/[locale]/components/ui/Button";
import { Card } from "@/app/[locale]/components/ui/Card";
import { EmptyState } from "@/app/[locale]/components/ui/EmptyState";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import getProfileGrid from "@/app/[locale]/actions/profile/getProfileGrid";
import { getUser } from "@/app/[locale]/utils/data";
import { getProfileData } from "@/app/[locale]/utils/profile-queries";
import { getProfileTarget } from "@/app/[locale]/utils/users";
import { canViewProfile } from "@/app/[locale]/utils/visibility";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string; locale: string }>;
}) {
  const supabase = await createClient();
  const { username } = await params;

  const viewer = await getUser(supabase);
  if (!viewer) redirect("/loginpage");

  const target = await getProfileTarget(supabase, username);
  if (!target) notFound();

  const t = await getTranslations("Profile");
  const isOwner = viewer.id === target.id;

  if (!isOwner && !(await canViewProfile(supabase, viewer.id, target.id))) {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={<Lock />}
          title={t("privateTitle")}
          description={t("privateText", { name: target.displayName })}
          action={
            <ButtonLink
              href={`/socialpage/${viewer.user_metadata.displayName}`}
              variant="secondary"
              icon={<Groups />}
            >
              {t("privateAction")}
            </ButtonLink>
          }
          className="mt-8 bg-surface"
        />
      </PageShell>
    );
  }

  // The grid used to be fetched client-side after mount, behind a spinner
  // that could never actually show; now it arrives with the page.
  const [profile, gridImages] = await Promise.all([
    getProfileData(supabase, target.id),
    getProfileGrid(target.id),
  ]);

  return (
    <PageShell>
      <Card variant="gradient" padding="lg">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <ProfilePicture
            userId={target.id}
            displayName={target.displayName}
            currUser={isOwner}
            profilePic={profile.hasProfilePicture}
            profilePicUrl={profile.profilePictureUrl}
          />
          <ProfileInfos
            displayName={target.displayName}
            animalCount={profile.animalCount}
            listsCount={profile.listsCount}
            teamIcon={profile.teamIcon}
            favoriteAnimal={profile.favoriteAnimal}
            currUser={isOwner}
            instaLink={profile.instaLink}
          />
        </div>
      </Card>

      <PictureGrid
        userId={target.id}
        displayName={target.displayName}
        currUser={isOwner}
        initialImages={gridImages}
      />

      <ProfileAchievements achievements={profile.achievements} />

      <ProfileAnimalLists data={profile.lists} username={target.displayName} isOwner={isOwner} />

      <ProfileActivity
        activity={profile.activity}
        displayName={target.displayName}
        isOwner={isOwner}
      />
    </PageShell>
  );
}
