"use client";

import { CheckCircle, EmojiEvents, HowToVote } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import castVote from "@/app/[locale]/actions/contest/castVote";
import type { EntryView, MatchupView } from "@/app/[locale]/utils/contest-queries";
import { roundCount } from "@/app/[locale]/utils/contestBracket";
import { cn } from "@/app/[locale]/utils/cn";
import { Link } from "@/i18n/navigation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import { useToast } from "../ui/Toast";

type Entries = Record<string, Pick<EntryView, "username" | "thumbUrl" | "mainUrl" | "isMine">>;

/** "Final", "Semi-final", "Quarter-final" or "Round of 16/32/64". */
function useRoundName(rounds: number) {
  const t = useTranslations("Contest.bracket");
  return (round: number) => {
    const remaining = rounds - round;
    if (remaining === 0) return t("final");
    if (remaining === 1) return t("semifinal");
    if (remaining === 2) return t("quarterfinal");
    return t("roundOf", { count: 2 ** (remaining + 1) });
  };
}

/** One side of an open matchup: the photo, who took it and the vote button. */
function Side({
  entry,
  votes,
  total,
  voted,
  busy,
  onVote,
  onOpen,
}: {
  entry: Entries[string] | undefined;
  votes: number | null;
  total: number;
  voted: boolean;
  busy: boolean;
  onVote: () => void;
  onOpen: () => void;
}) {
  const t = useTranslations("Contest");
  const share = votes !== null && total > 0 ? Math.round((votes / total) * 100) : null;
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden rounded-lg border", voted ? "border-accent" : "border-border-muted")}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("gallery.open", { name: entry?.username ?? t("unknownUser") })}
        className="relative aspect-[4/3] w-full bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {entry?.thumbUrl && (
          <Image src={entry.thumbUrl} alt="" fill unoptimized sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
        )}
      </button>
      <div className="flex flex-col gap-2 p-2 text-sm">
        {entry?.username ? (
          <Link href={`/profilepage/${entry.username}`} className="truncate font-medium hover:underline">
            {entry.username}
          </Link>
        ) : (
          <span className="truncate text-fg-muted">{t("unknownUser")}</span>
        )}
        {share !== null && (
          <span className="text-xs tabular-nums text-fg-muted">
            {t("bracket.votes", { count: votes ?? 0 })} · {share}%
          </span>
        )}
        {entry?.isMine ? (
          <span className="text-xs text-fg-subtle">{t("bracket.yourPhoto")}</span>
        ) : (
          <Button
            size="sm"
            variant={voted ? "primary" : "secondary"}
            icon={voted ? <CheckCircle /> : <HowToVote />}
            aria-pressed={voted}
            loading={busy}
            onClick={onVote}
          >
            {voted ? t("bracket.voted") : t("bracket.vote")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * The bracket: the open matchups of the running round to vote on, and the
 * whole tree round by round, with winners highlighted.
 */
export default function Bracket({
  matchups,
  entries,
  bracketSize,
  speciesName,
}: {
  matchups: MatchupView[];
  entries: Entries;
  bracketSize: number;
  speciesName: string;
}) {
  const t = useTranslations("Contest");
  const format = useFormatter();
  const toast = useToast();
  const router = useRouter();
  const rounds = roundCount(bracketSize);
  const roundName = useRoundName(rounds);
  const [myVotes, setMyVotes] = useState(() => Object.fromEntries(matchups.map((m) => [m.id, m.myVote])));
  const [busy, setBusy] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const open = matchups.filter((m) => m.open);
  const votable = open.filter((m) => !entries[m.entryA!]?.isMine && !entries[m.entryB!]?.isMine);

  async function vote(matchup: MatchupView, entryId: string) {
    const previous = myVotes[matchup.id];
    setBusy(`${matchup.id}:${entryId}`);
    setMyVotes((current) => ({ ...current, [matchup.id]: entryId }));
    try {
      const res = await castVote(matchup.id, entryId);
      if (!res.success) throw new Error(res.error);
      // Counts become visible after voting; they come from the server.
      router.refresh();
    } catch (error) {
      console.error("Vote failed:", error);
      setMyVotes((current) => ({ ...current, [matchup.id]: previous }));
      toast(t("errors.voteClosed"), "error");
    } finally {
      setBusy(null);
    }
  }

  const lightboxEntry = lightbox ? entries[lightbox] : undefined;

  return (
    <div className="flex flex-col gap-6">
      {open.length > 0 && (
        <section aria-labelledby="contest-open-round" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id="contest-open-round" className="text-lg font-semibold">
              {roundName(open[0].round)}
            </h3>
            <p className="text-sm text-fg-muted">
              {t("bracket.closes", {
                time: format.dateTime(new Date(open[0].endsAt), { weekday: "long", hour: "2-digit", minute: "2-digit" }),
              })}
              {" · "}
              {t("bracket.progress", {
                voted: votable.filter((m) => myVotes[m.id]).length,
                total: votable.length,
              })}
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {open.map((m) => {
              const total = (m.votesA ?? 0) + (m.votesB ?? 0);
              return (
                <Card as="li" key={m.id} padding="sm" className="flex items-stretch gap-2">
                  {([m.entryA!, m.entryB!] as const).map((entryId, index) => (
                    <Side
                      key={entryId}
                      entry={entries[entryId]}
                      votes={index === 0 ? m.votesA : m.votesB}
                      total={total}
                      voted={myVotes[m.id] === entryId}
                      busy={busy === `${m.id}:${entryId}`}
                      onVote={() => void vote(m, entryId)}
                      onOpen={() => setLightbox(entryId)}
                    />
                  ))}
                </Card>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="contest-tree" className="flex flex-col gap-3">
        <h3 id="contest-tree" className="text-lg font-semibold">
          {t("bracket.tree")}
        </h3>
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <ol className="flex min-w-max gap-4">
            {Array.from({ length: rounds }, (_, index) => index + 1).map((round) => {
              const inRound = matchups.filter((m) => m.round === round);
              return (
                <li key={round} className="flex w-52 flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{roundName(round)}</p>
                  {inRound.length === 0 ? (
                    <p className="text-sm text-fg-subtle">{t("bracket.upcoming")}</p>
                  ) : (
                    <ul className="flex flex-1 flex-col justify-around gap-2">
                      {inRound.map((m) => (
                        <li key={m.id} className="flex flex-col overflow-hidden rounded-lg border border-border-muted bg-surface text-sm">
                          {[
                            { id: m.entryA, votes: m.votesA },
                            { id: m.entryB, votes: m.votesB },
                          ].map((side, index) => {
                            const entry = side.id ? entries[side.id] : undefined;
                            const won = side.id !== null && m.winner === side.id;
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1.5",
                                  index === 1 && "border-t border-border-muted",
                                  won && "bg-accent/10 font-semibold",
                                  m.winner && !won && "text-fg-subtle",
                                )}
                              >
                                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded bg-surface-sunken">
                                  {entry?.thumbUrl && (
                                    <Image src={entry.thumbUrl} alt="" fill unoptimized sizes="28px" className="object-cover" />
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  {side.id === null ? t("bracket.bye") : (entry?.username ?? t("bracket.removed"))}
                                </span>
                                {side.votes !== null && side.id !== null && m.entryA && m.entryB && (
                                  <span className="tabular-nums text-xs text-fg-muted">{side.votes}</span>
                                )}
                                {won && round === rounds && (
                                  <EmojiEvents sx={{ fontSize: 16 }} className="text-amber-500" aria-label={t("bracket.winner")} />
                                )}
                              </div>
                            );
                          })}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {lightboxEntry?.mainUrl && (
        <PhotoLightbox
          src={lightboxEntry.mainUrl}
          alt={t("gallery.alt", { name: speciesName, user: lightboxEntry.username ?? t("unknownUser") })}
          label={t("gallery.alt", { name: speciesName, user: lightboxEntry.username ?? t("unknownUser") })}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
