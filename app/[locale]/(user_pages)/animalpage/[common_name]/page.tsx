import {
  CalendarMonth,
  Compare,
  Groups,
  Height,
  Landscape,
  Numbers,
  Star,
  Wc,
} from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import AnimalBanner from "@/app/[locale]/components/animals/AnimalBanner";
import RecentAnimalImageUploads, {
  type CommunityPhoto,
} from "@/app/[locale]/components/animals/RecentAnimalImageUploads";
import FavoriteFunctionality from "@/app/[locale]/components/general/FavoriteFunctionality";
import ListFunctionality from "@/app/[locale]/components/general/ListFunctionality";
import SuggestEditDialog from "@/app/[locale]/components/lexicon/SuggestEditDialog";
import { Card } from "@/app/[locale]/components/ui/Card";
import { cn } from "@/app/[locale]/utils/cn";
import { getUser } from "@/app/[locale]/utils/data";
import { collectionImageName } from "@/app/[locale]/utils/storagePaths";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/server";
import type { TypedSupabaseClient } from "@/utils/supabase/types";

const getAnimalData = async (supabase: TypedSupabaseClient, name: string) => {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("common_name", decodeURIComponent(name))
    .maybeSingle();
  if (error) console.error("Error fetching animal Data", error);
  return data;
};

const getSpottedList = async (supabase: TypedSupabaseClient, user: User) => {
  const { data, error } = await supabase
    .from("spotted")
    .select("animal_id")
    .eq("user_id", user.id);
  if (error) {
    console.error("Error getting spotted List", error);
    return [];
  }
  return data.map((animal) => animal.animal_id).filter((id): id is number => id !== null);
};

const getSpottedCount = async (supabase: TypedSupabaseClient, animalId: number) => {
  const { count, error } = await supabase
    .from("spotted")
    .select("animal_id", { count: "exact", head: true })
    .eq("animal_id", animalId);
  if (error) {
    console.error("Error getting animal count", error);
    return 0;
  }
  return count ?? 0;
};

/**
 * Recent collection photos of this species from users whose profile is public
 * (plus the viewer's own). This page is open to anyone, including signed-out
 * visitors, and it used to sign photos from every user — private profiles
 * included.
 */
const getCommunityPhotos = async (
  supabase: TypedSupabaseClient,
  animalId: number,
  commonName: string,
  viewerId: string | null,
): Promise<CommunityPhoto[]> => {
  const { data, error } = await supabase
    .from("spotted")
    .select("user_id")
    .eq("animal_id", animalId)
    .eq("image", true)
    .order("image_updated_at", { ascending: false, nullsFirst: false })
    .limit(24);
  if (error) {
    console.error("Error getting recent images user list", error);
    return [];
  }
  const candidates = data.map((row) => row.user_id).filter((id): id is string => id !== null);
  if (candidates.length === 0) return [];

  const { data: publicProfiles } = await supabase
    .from("profiles")
    .select("user_id")
    .in("user_id", candidates)
    .eq("is_public", true);
  const allowed = new Set((publicProfiles ?? []).map((row) => row.user_id));
  if (viewerId) allowed.add(viewerId);
  const ids = candidates.filter((id) => allowed.has(id)).slice(0, 6);
  if (ids.length === 0) return [];

  const { data: users, error: nameError } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", ids);
  if (nameError) {
    console.error("Error getting usernames", nameError);
    return [];
  }

  const objectName = collectionImageName(commonName);
  const photos = await Promise.all(
    ids.map(async (id) => {
      const user = users.find((row) => row.id === id);
      if (!user) return null;
      const { data: signed } = await supabase.storage
        .from("profiles")
        .createSignedUrl(`${id}/CollectionModals/${objectName}`, 60 * 60);
      return signed ? { ...user, imageUrl: signed.signedUrl } : null;
    }),
  );
  return photos.filter((photo): photo is CommunityPhoto => photo !== null);
};

/**
 * Sizes are stored in centimetres and shown in whichever unit keeps the number
 * readable. Both columns are nullable, so a species with no recorded size shows
 * a dash rather than "NaN cm".
 */
const formatSizeRange = (from: number | null, to: number | null) => {
  if (from === null || to === null) return "–";
  if (to >= 100) return `${from / 100} – ${to / 100} m`;
  if (to > 0) return `${from} – ${to} cm`;
  return `${from * 100} – ${to * 100} mm`;
};

const STATUS_SCALE = [
  "Nicht gefährdet",
  "Vorwarnliste",
  "Gefährdet",
  "Stark gefährdet",
  "Vom Aussterben bedroht",
] as const;
const SCALE_TONES = ["bg-green-600", "bg-yellow-500", "bg-orange-500", "bg-orange-700", "bg-red-600"];

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-text [&_svg]:h-5 [&_svg]:w-5"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</dt>
        <dd className="text-fg">{children}</dd>
      </div>
    </div>
  );
}

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ common_name: string; locale: string }>;
}) {
  const { common_name } = await params;
  const supabase = await createClient();
  const [user, animal, t, tLex] = await Promise.all([
    getUser(supabase),
    getAnimalData(supabase, common_name),
    getTranslations("Animal"),
    getTranslations("Lexicon"),
  ]);
  // An unknown species used to throw on `animal.id`; it is a 404.
  if (!animal) notFound();

  const [spottedList, spottedCount, photos] = await Promise.all([
    user ? getSpottedList(supabase, user) : Promise.resolve([]),
    getSpottedCount(supabase, animal.id),
    getCommunityPhotos(supabase, animal.id, animal.common_name, user?.id ?? null),
  ]);

  const status = animal.endangerment_status;
  const statusStep = STATUS_SCALE.indexOf(status as (typeof STATUS_SCALE)[number]);
  const hasDimorphism = animal.sexual_dimorphism && animal.sexual_dimorphism !== "Nein";

  return (
    <div className="w-full bg-canvas font-normal text-fg">
      <AnimalBanner
        image={animal.image_link}
        alt={animal.common_name}
        credit_link={animal.image_credit_link}
        credit_text={animal.image_credit_text}
        license_link={animal.image_license_link}
        license_text={animal.image_license_text}
      />

      <div className="relative mx-auto -mt-16 flex max-w-5xl flex-col gap-6 px-4 pb-16 sm:-mt-24 sm:px-6">
        <Card variant="solid" padding="lg" className="flex flex-col gap-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {animal.common_name}
                </h1>
                {animal.very_rare && (
                  <span
                    title={t("rareTooltip")}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                  >
                    <Star sx={{ fontSize: 14 }} aria-hidden />
                    {t("rare")}
                    <span className="sr-only">: {t("rareTooltip")}</span>
                  </span>
                )}
              </div>
              <p className="text-lg italic text-fg-muted">{animal.scientific_name}</p>
              {animal.taxonomic_order && (
                <p className="text-sm text-fg-subtle">
                  {animal.category && tLex.has(animal.category) ? `${tLex(animal.category)} · ` : ""}
                  {animal.taxonomic_order}
                </p>
              )}
            </div>
            {user && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 rounded-full border border-border-muted p-1">
                  <FavoriteFunctionality
                    user={user}
                    id={animal.id}
                    name={animal.common_name}
                    spottedList={spottedList}
                    buttonStyles="h-11 w-11"
                  />
                  <ListFunctionality user={user} id={animal.id} buttonStyles="h-11 w-11" />
                </div>
                <SuggestEditDialog
                  animalId={animal.id}
                  animalName={animal.common_name}
                  currentDescription={animal.description}
                />
              </div>
            )}
          </header>

          <div className="grid gap-6 border-t border-border-muted pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                {t("status")}
              </h2>
              <p className="text-lg font-semibold">{status && tLex.has(status) ? tLex(status) : status ?? "–"}</p>
              {statusStep >= 0 && (
                <div role="img" aria-label={t("statusScale")} className="flex gap-1">
                  {STATUS_SCALE.map((step, i) => (
                    <span
                      key={step}
                      className={cn(
                        "h-2 flex-1 rounded-full",
                        i <= statusStep ? SCALE_TONES[i] : "bg-surface-sunken",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-surface-raised p-4">
              <Groups aria-hidden className="text-accent-text" />
              <p className="text-fg-muted">{t("spottedBy", { count: spottedCount })}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {animal.description && (
            <Card padding="lg" className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">{t("about")}</h2>
              <p className="whitespace-pre-line leading-relaxed text-fg-muted">
                {animal.description}
              </p>
            </Card>
          )}
          <Card padding="lg" className={cn(!animal.description && "lg:col-span-2")}>
            <h2 className="mb-4 text-xl font-semibold">{t("facts")}</h2>
            <dl className="flex flex-col gap-4">
              <Fact icon={<Height />} label={t("size")}>
                {formatSizeRange(animal.size_from, animal.size_to)}
              </Fact>
              {animal.population_estimate && (
                <Fact icon={<Numbers />} label={t("population")}>
                  {animal.population_estimate}
                </Fact>
              )}
              {animal.presence_time && (
                <Fact icon={<CalendarMonth />} label={t("presence")}>
                  {animal.presence_time}
                </Fact>
              )}
              {animal.habitat && (
                <Fact icon={<Landscape />} label={t("habitat")}>
                  {animal.habitat}
                </Fact>
              )}
              {hasDimorphism && (
                <Fact icon={<Wc />} label={t("dimorphism")}>
                  {animal.sexual_dimorphism}
                </Fact>
              )}
              {animal.similar_animals && animal.similar_animals.length > 0 && (
                <Fact icon={<Compare />} label={t("similar")}>
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {animal.similar_animals.map((similar) => (
                      <Link
                        key={similar}
                        href={`/animalpage/${similar}`}
                        className="text-accent-text hover:underline"
                      >
                        {similar}
                      </Link>
                    ))}
                  </span>
                </Fact>
              )}
            </dl>
          </Card>
        </div>

        <section aria-labelledby="community-photos" className="flex flex-col gap-4">
          <h2 id="community-photos" className="text-xl font-semibold">
            {t("communityPhotos")}
          </h2>
          <RecentAnimalImageUploads data={photos} animal={animal.common_name} />
        </section>
      </div>
    </div>
  );
}
