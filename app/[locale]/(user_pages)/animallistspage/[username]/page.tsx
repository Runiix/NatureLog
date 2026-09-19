import AnimalLists from "@/app/[locale]/components/animallists/AnimalLists";
import { getUser } from "@/app/[locale]/utils/data";
import { getProfileTarget } from "@/app/[locale]/utils/users";
import { createClient } from "@/utils/supabase/server";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/app/[locale]/components/ui/PageHeader";
import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import CreateListButton from "@/app/[locale]/components/animallists/CreateListButton";

const getAnimalLists = async (
  supabase: TypedSupabaseClient,
  userId: string,
  onlyPublic: boolean,
) => {
  let query = supabase
    .from("animallists")
    .select("id, title, description, is_public")
    .eq("user_id", userId);

  if (onlyPublic) query = query.eq("is_public", true);

  const { data, error } = await query;
  if (error) {
    console.error("Error getting Animal Lists", error);
    return [];
  }
  return data;
};

const getSpottedIds = async (
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<number[]> => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", userId);
  if (error) {
    console.error("Error getting spotted List", error);
    return [];
  }
  return data
    .map((row) => row.animal_id)
    .filter((id): id is number => id !== null);
};

export default async function AnimalListsPage({ params }: { params: Promise<{ username: string; locale: string }> }) {
  const supabase = await createClient();
  const { username } = await params;
  const viewer = await getUser(supabase);
  if (!viewer) redirect("/loginpage");

  const target = await getProfileTarget(supabase, username);
  if (!target) notFound();

  const isOwner = viewer.id === target.id;

  const t = await getTranslations("Lists");

  // Own lists include private ones; a visitor only ever sees the public set.
  // The spotted ids drive the favourite buttons, which act on the *viewer's*
  // collection, so they are the viewer's — they used to be the owner's.
  const [animalLists, spottedIds] = await Promise.all([
    getAnimalLists(supabase, target.id, !isOwner),
    getSpottedIds(supabase, viewer.id),
  ]);

  return (
    <PageShell>
      <PageHeader
        title={isOwner ? t("myLists") : t("usersLists", { name: target.displayName })}
        subtitle={isOwner ? t("subtitleOwner") : t("subtitleVisitor")}
        backHref={isOwner ? undefined : `/profilepage/${target.displayName}`}
        backLabel={t("backToProfile")}
        actions={isOwner && animalLists.length > 0 ? <CreateListButton /> : undefined}
      />
      <AnimalLists
        data={animalLists}
        user={viewer}
        spottedList={spottedIds}
        currUser={isOwner}
        ownerName={target.displayName}
      />
    </PageShell>
  );
}
