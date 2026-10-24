/**
 * @jest-environment node
 */
import {
  addWeeks,
  bracketSize,
  contestTimeline,
  firstRound,
  isDecided,
  matchupWinner,
  nextRound,
  roundCount,
  roundDays,
  roundSchedule,
  seedEntries,
  seedOrder,
  weekStartOf,
  type MatchupTally,
} from "@/app/[locale]/utils/contestBracket";

describe("bracketSize", () => {
  test("needs at least four entries", () => {
    expect(bracketSize(0)).toBeNull();
    expect(bracketSize(3)).toBeNull();
    expect(bracketSize(4)).toBe(4);
  });

  test("grows to the next power of two", () => {
    expect([5, 8, 9, 16, 17, 32, 33, 64].map(bracketSize)).toEqual([8, 8, 16, 16, 32, 32, 64, 64]);
  });

  test("is capped at 64", () => {
    expect(bracketSize(200)).toBe(64);
    expect(roundCount(64)).toBe(6);
  });
});

describe("seedOrder", () => {
  test("pairs the best seed with the worst", () => {
    expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  test("places every seed exactly once", () => {
    const order = seedOrder(64);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  test("the top two seeds are in different halves", () => {
    const order = seedOrder(32);
    expect(order.indexOf(1) < 16).toBe(true);
    expect(order.indexOf(2) >= 16).toBe(true);
  });
});

describe("seedEntries", () => {
  const entry = (id: string, likes: number, createdAt: string) => ({ id, likes, createdAt });

  test("most likes first, earlier entry breaks ties, cut to size", () => {
    const seeded = seedEntries(
      [
        entry("late", 5, "2026-10-05T12:00:00Z"),
        entry("top", 9, "2026-10-06T00:00:00Z"),
        entry("early", 5, "2026-10-05T08:00:00Z"),
        entry("low", 1, "2026-10-05T00:00:00Z"),
      ],
      3,
    );
    expect(seeded.map((e) => e.id)).toEqual(["top", "early", "late"]);
  });
});

describe("firstRound", () => {
  test("a full bracket has no byes", () => {
    const matchups = firstRound(["s1", "s2", "s3", "s4"], 4);
    expect(matchups).toEqual([
      { round: 1, slot: 0, entryA: "s1", entryB: "s4", winner: null },
      { round: 1, slot: 1, entryA: "s2", entryB: "s3", winner: null },
    ]);
  });

  test("missing low seeds give the top seeds byes", () => {
    const matchups = firstRound(["s1", "s2", "s3", "s4", "s5"], 8);
    const byes = matchups.filter((m) => m.entryB === null);
    expect(byes.map((m) => m.winner)).toEqual(["s1", "s2", "s3"]);
    expect(matchups.find((m) => m.entryB !== null)).toMatchObject({ entryA: "s4", entryB: "s5", winner: null });
    expect(matchups.every((m) => m.entryA !== null)).toBe(true);
  });
});

describe("nextRound", () => {
  test("pairs neighbouring winners", () => {
    expect(nextRound(["a", "b", "c", "d"], 2)).toEqual([
      { round: 2, slot: 0, entryA: "a", entryB: "b", winner: null },
      { round: 2, slot: 1, entryA: "c", entryB: "d", winner: null },
    ]);
  });

  test("a missing side is decided at once", () => {
    const [matchup] = nextRound(["a", null], 3);
    expect(matchup.winner).toBe("a");
    expect(isDecided(matchup)).toBe(true);
    expect(isDecided(nextRound([null, null], 3)[0])).toBe(true);
  });
});

describe("matchupWinner", () => {
  const tally = (overrides: Partial<MatchupTally> = {}): MatchupTally => ({
    entryA: "a",
    entryB: "b",
    votesA: 0,
    votesB: 0,
    seedA: 1,
    seedB: 2,
    liveA: true,
    liveB: true,
    ...overrides,
  });

  test("more votes win", () => {
    expect(matchupWinner(tally({ votesA: 3, votesB: 5 }))).toBe("b");
  });

  test("a tie goes to the better seed", () => {
    expect(matchupWinner(tally({ votesA: 4, votesB: 4, seedA: 7, seedB: 2 }))).toBe("b");
    expect(matchupWinner(tally())).toBe("a");
  });

  test("a removed entry forfeits whatever the votes", () => {
    expect(matchupWinner(tally({ votesA: 10, liveA: false }))).toBe("b");
    expect(matchupWinner(tally({ liveA: false, liveB: false }))).toBeNull();
  });
});

describe("schedule", () => {
  test("rounds share the seven voting days, the final gets the spare ones", () => {
    expect(roundDays(6)).toEqual([1, 1, 1, 1, 1, 2]);
    expect(roundDays(5)).toEqual([1, 1, 1, 2, 2]);
    expect(roundDays(4)).toEqual([1, 2, 2, 2]);
    expect(roundDays(3)).toEqual([2, 2, 3]);
    expect(roundDays(2)).toEqual([3, 4]);
    for (let rounds = 2; rounds <= 6; rounds++) {
      expect(roundDays(rounds).reduce((sum, days) => sum + days, 0)).toBe(7);
    }
  });

  test("round windows are back to back and end with the voting week", () => {
    const { votingStart, votingEnd } = contestTimeline("2026-10-05");
    const windows = roundSchedule(3, votingStart);
    expect(windows[0].startsAt.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(windows[1].startsAt).toEqual(windows[0].endsAt);
    expect(windows[2].endsAt).toEqual(votingEnd);
    expect(votingEnd.toISOString()).toBe("2026-10-19T00:00:00.000Z");
  });

  test("weeks start on Monday UTC", () => {
    expect(weekStartOf(new Date("2026-10-05T00:00:00Z"))).toBe("2026-10-05");
    expect(weekStartOf(new Date("2026-10-11T23:59:59Z"))).toBe("2026-10-05");
    expect(weekStartOf(new Date("2026-10-12T00:00:00Z"))).toBe("2026-10-12");
    expect(addWeeks("2026-12-28", 1)).toBe("2027-01-04");
    expect(addWeeks("2026-10-12", -1)).toBe("2026-10-05");
  });
});
