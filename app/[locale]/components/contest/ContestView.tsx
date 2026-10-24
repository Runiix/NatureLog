import { EmojiEvents } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { getBracket, getEntries, type ContestSummary } from "@/app/[locale]/utils/contest-queries";
import type { TypedSupabaseClient } from "@/utils/supabase/types";
import { Card } from "../ui/Card";
import Bracket from "./Bracket";
import ContestHeader from "./ContestHeader";
import EntryGallery from "./EntryGallery";
import SubmitEntry from "./SubmitEntry";

/**
 * One contest in whatever phase it is in: the entry gallery while it takes
 * entries, the bracket while it is voted on and after it has finished.
 */
export default async function ContestView({
  supabase,
  contest,
  viewerId,
}: {
  supabase: TypedSupabaseClient;
  contest: ContestSummary;
  viewerId: string;
}) {
  const t = await getTranslations("Contest");
  const speciesName = contest.animal?.commonName ?? t("unknownSpecies");

  if (contest.status === "submission") {
    const [entries, { data: spotted }] = await Promise.all([
      getEntries(supabase, contest.id, viewerId),
      supabase
        .from("spotted")
        .select("id")
        .match({ user_id: viewerId, animal_id: contest.animal?.id ?? -1 })
        .maybeSingle(),
    ]);
    const entered = entries.some((entry) => entry.isMine);
    return (
      <Card className="flex flex-col gap-5">
        <ContestHeader
          contest={contest}
          actions={
            entered ? (
              <p className="text-sm text-fg-muted">{t("submit.entered")}</p>
            ) : (
              <SubmitEntry contestId={contest.id} speciesName={speciesName} inCollection={!!spotted} />
            )
          }
        />
        <p className="text-sm text-fg-muted">{t("submissionHint")}</p>
        {/* Keyed on the entries so a refresh after entering or withdrawing remounts it. */}
        <EntryGallery
          key={entries.map((entry) => entry.id).join()}
          entries={entries}
          open
          speciesName={speciesName}
        />
      </Card>
    );
  }

  if (contest.status === "voting" || contest.status === "finished") {
    const [entries, matchups] = await Promise.all([
      getEntries(supabase, contest.id, viewerId),
      getBracket(supabase, contest.id, viewerId),
    ]);
    const byId = Object.fromEntries(
      entries.map((entry) => [
        entry.id,
        { username: entry.username, thumbUrl: entry.thumbUrl, mainUrl: entry.mainUrl, isMine: entry.isMine },
      ]),
    );
    const winner = contest.winnerEntryId ? byId[contest.winnerEntryId] : undefined;

    return (
      <Card className="flex flex-col gap-5">
        <ContestHeader contest={contest} />
        {contest.status === "finished" && (
          <p className="flex items-center gap-2 font-medium">
            <EmojiEvents className="text-amber-500" aria-hidden />
            {winner?.username
              ? t(contest.vetoed ? "winnerVetoed" : "winnerAnnounced", { name: winner.username })
              : t("noWinner")}
          </p>
        )}
        {contest.status === "voting" && <p className="text-sm text-fg-muted">{t("votingHint")}</p>}
        {contest.bracketSize && matchups.length > 0 && (
          <Bracket
            matchups={matchups}
            entries={byId}
            bracketSize={contest.bracketSize}
            speciesName={speciesName}
          />
        )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <ContestHeader contest={contest} />
      <p className="text-sm text-fg-muted">{t(contest.status === "cancelled" ? "cancelledText" : "scheduledText")}</p>
    </Card>
  );
}
