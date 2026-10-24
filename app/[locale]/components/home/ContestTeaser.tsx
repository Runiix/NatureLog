import { EmojiEvents } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import type { ContestSummary } from "@/app/[locale]/utils/contest-queries";
import { ButtonLink } from "../ui/Button";

/** This week's photo contest on the home page: what to photograph, or what to vote on. */
export default async function ContestTeaser({
  submission,
  voting,
}: {
  submission: ContestSummary | null;
  voting: ContestSummary | null;
}) {
  const t = await getTranslations("Contest.teaser");
  const name = (contest: ContestSummary) => contest.animal?.commonName ?? "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400"
      >
        <EmojiEvents />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-fg-muted">
          {submission
            ? t("submission", { name: name(submission) })
            : voting
              ? t("voting", { name: name(voting) })
              : t("none")}
          {voting && submission && <> {t("alsoVoting", { name: name(voting) })}</>}
        </p>
      </div>
      <ButtonLink href="/contestpage" size="sm" className="self-start sm:self-center">
        {t("open")}
      </ButtonLink>
    </div>
  );
}
