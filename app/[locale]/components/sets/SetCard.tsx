import { CameraAlt, EmojiEvents } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import type { SetProgress } from "@/app/[locale]/utils/setProgress";
import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

/** Spotted and photographed bars for a set, with a badge for each finished one. */
export async function SetProgressBars({ progress }: { progress: SetProgress }) {
  const t = await getTranslations("Sets");
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
      <span className="text-fg-muted">{t("spotted")}</span>
      <ProgressBar label={t("spotted")} value={progress.spotted} max={progress.total} />
      <span className="text-fg-muted">{t("photographed")}</span>
      <ProgressBar label={t("photographed")} value={progress.photographed} max={progress.total} />
    </div>
  );
}

export async function SetBadges({ progress }: { progress: SetProgress }) {
  const t = await getTranslations("Sets");
  if (!progress.complete) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg">
        <EmojiEvents sx={{ fontSize: 14 }} aria-hidden />
        {t("complete")}
      </span>
      {progress.completePhotos && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-amber-950">
          <CameraAlt sx={{ fontSize: 14 }} aria-hidden />
          {t("completePhotos")}
        </span>
      )}
    </div>
  );
}

/** One set in the overview, linking to its species. */
export default async function SetCard({
  listId,
  title,
  description,
  progress,
}: {
  listId: string;
  title: string | null;
  description: string | null;
  progress: SetProgress;
}) {
  const t = await getTranslations("Sets");
  return (
    <Card as={Link} href={`/setspage/${listId}`} interactive className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug">{title || t("untitled")}</h2>
        {description && <p className="line-clamp-2 text-sm text-fg-muted">{description}</p>}
      </div>
      <SetBadges progress={progress} />
      <div className="mt-auto">
        <SetProgressBars progress={progress} />
      </div>
    </Card>
  );
}
