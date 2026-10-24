/**
 * The weekly photo contest's schedule and knockout bracket. Pure, so the
 * seeding, byes, tie-breaks and round timing are unit-tested; the advance job
 * (utils/contest/advanceContests.ts) only reads and writes rows.
 *
 * A contest takes entries for one week (Monday 00:00 UTC to the next Monday)
 * and runs its bracket the week after.
 */

export const MIN_ENTRIES = 4;
export const MAX_BRACKET = 64;

const DAY_MS = 86_400_000;
const WEEK_DAYS = 7;

/** Bracket size for a number of entries: the next power of two, capped at 64; null below 4. */
export function bracketSize(entries: number): number | null {
  if (entries < MIN_ENTRIES) return null;
  let size = MIN_ENTRIES;
  while (size < entries && size < MAX_BRACKET) size *= 2;
  return size;
}

export const roundCount = (size: number) => Math.round(Math.log2(size));

/**
 * Standard seeding: the seed (1-based) at each bracket position. Neighbouring
 * positions meet in round one, so seed 1 plays the lowest seed and the top
 * two seeds can only meet in the final.
 */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const next = order.length * 2;
    order = order.flatMap((seed) => [seed, next + 1 - seed]);
  }
  return order;
}

export type SeedableEntry = { id: string; likes: number; createdAt: string };

/** Entries in seed order, cut to the bracket: most likes first, earlier entry breaks ties. */
export function seedEntries<T extends SeedableEntry>(entries: T[], size: number): T[] {
  return [...entries]
    .sort(
      (a, b) =>
        b.likes - a.likes ||
        Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, size);
}

export type PlannedMatchup = {
  round: number;
  slot: number;
  entryA: string | null;
  entryB: string | null;
  /** Set at once when a side is missing (a bye or a forfeit). */
  winner: string | null;
};

const planned = (round: number, slot: number, entryA: string | null, entryB: string | null): PlannedMatchup => ({
  round,
  slot,
  entryA,
  entryB,
  winner: entryA && entryB ? null : (entryA ?? entryB),
});

/**
 * Round one from entry ids in seed order. With fewer entries than the bracket
 * holds, the missing low seeds are byes: the top seeds go through unopposed.
 */
export function firstRound(seededIds: string[], size: number): PlannedMatchup[] {
  const order = seedOrder(size);
  return Array.from({ length: size / 2 }, (_, slot) =>
    planned(1, slot, seededIds[order[2 * slot] - 1] ?? null, seededIds[order[2 * slot + 1] - 1] ?? null),
  );
}

/** The next round from the previous round's winners in slot order: slots 0 and 1 meet, 2 and 3, … */
export function nextRound(winners: (string | null)[], round: number): PlannedMatchup[] {
  return Array.from({ length: winners.length / 2 }, (_, slot) =>
    planned(round, slot, winners[2 * slot], winners[2 * slot + 1]),
  );
}

/** A matchup is decided once it has a winner or cannot be played (a side is missing). */
export const isDecided = (matchup: { entryA: string | null; entryB: string | null; winner: string | null }) =>
  matchup.winner !== null || matchup.entryA === null || matchup.entryB === null;

export type MatchupTally = {
  entryA: string | null;
  entryB: string | null;
  votesA: number;
  votesB: number;
  seedA: number | null;
  seedB: number | null;
  /** False for an entry that was taken down: it forfeits. */
  liveA: boolean;
  liveB: boolean;
};

/**
 * Who goes through: a missing or removed side forfeits, otherwise more votes
 * win and a tie goes to the better (lower) seed. Null when neither side can.
 */
export function matchupWinner(m: MatchupTally): string | null {
  const a = m.entryA && m.liveA ? m.entryA : null;
  const b = m.entryB && m.liveB ? m.entryB : null;
  if (!a || !b) return a ?? b;
  if (m.votesA !== m.votesB) return m.votesA > m.votesB ? a : b;
  return (m.seedA ?? Infinity) <= (m.seedB ?? Infinity) ? a : b;
}

/** Days per round across the voting week; later rounds get the spare days. */
export function roundDays(rounds: number): number[] {
  const base = Math.floor(WEEK_DAYS / rounds);
  const extra = WEEK_DAYS % rounds;
  return Array.from({ length: rounds }, (_, index) => base + (index >= rounds - extra ? 1 : 0));
}

export type RoundWindow = { startsAt: Date; endsAt: Date };

/** When each round is open for votes, starting when the voting week starts. */
export function roundSchedule(rounds: number, votingStart: Date): RoundWindow[] {
  let start = votingStart.getTime();
  return roundDays(rounds).map((days) => {
    const startsAt = new Date(start);
    start += days * DAY_MS;
    return { startsAt, endsAt: new Date(start) };
  });
}

/** Monday (UTC) of the week containing `date`, as yyyy-mm-dd. */
export function weekStartOf(date: Date): string {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}

export function addWeeks(weekStart: string, weeks: number): string {
  const day = new Date(`${weekStart}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + weeks * WEEK_DAYS);
  return day.toISOString().slice(0, 10);
}

/** A contest's phases: entries until `votingStart`, the bracket until `votingEnd`. */
export function contestTimeline(weekStart: string) {
  const submissionStart = new Date(`${weekStart}T00:00:00Z`);
  return {
    submissionStart,
    votingStart: new Date(submissionStart.getTime() + WEEK_DAYS * DAY_MS),
    votingEnd: new Date(submissionStart.getTime() + 2 * WEEK_DAYS * DAY_MS),
  };
}
