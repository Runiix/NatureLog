import { CameraAlt, History, Visibility } from "@mui/icons-material";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ActivityEvent } from "@/app/[locale]/utils/achievements";
import { EmptyState } from "../ui/EmptyState";

export default async function ProfileActivity({
  activity,
  displayName,
  isOwner,
}: {
  activity: ActivityEvent[];
  displayName: string;
  isOwner: boolean;
}) {
  const [t, format] = await Promise.all([
    getTranslations("Profile.activity"),
    getFormatter(),
  ]);

  return (
    <section aria-labelledby="profile-activity" className="flex flex-col gap-4">
      <h2 id="profile-activity" className="text-xl font-semibold tracking-tight">
        {t("title")}
      </h2>

      {activity.length === 0 ? (
        <EmptyState
          icon={<History />}
          title={isOwner ? t("emptyOwner") : t("emptyVisitor", { name: displayName })}
        />
      ) : (
        <ol className="relative flex flex-col gap-4 border-l border-border-muted pl-6">
          {activity.map((event) => (
            <li key={`${event.kind}-${event.animal}-${event.at}`} className="relative">
              <span
                aria-hidden
                className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised text-accent-text ring-4 ring-canvas [&_svg]:h-3.5 [&_svg]:w-3.5"
              >
                {event.kind === "photo" ? <CameraAlt /> : <Visibility />}
              </span>
              <p className="text-sm">
                {t.rich(event.kind, {
                  name: event.animal,
                  animal: (chunks) => (
                    <Link
                      href={`/animalpage/${event.animal}`}
                      className="font-semibold text-accent-text underline-offset-2 hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
              <time dateTime={event.at} className="text-xs text-fg-subtle">
                {format.dateTime(new Date(event.at), { dateStyle: "medium" })}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
