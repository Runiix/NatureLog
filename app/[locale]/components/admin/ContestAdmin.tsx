"use client";

import { Block, CheckCircle, Delete, EventAvailable, FastForward, Undo } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import advanceContestsNow from "../../actions/admin/advanceContestsNow";
import type { ContestAdminData } from "../../actions/admin/getContestAdmin";
import revertContestWinner from "../../actions/admin/revertContestWinner";
import scheduleContest from "../../actions/admin/scheduleContest";
import setEntryExcluded from "../../actions/admin/setEntryExcluded";
import unscheduleContest from "../../actions/admin/unscheduleContest";
import { Link } from "@/i18n/navigation";
import { cn } from "@/app/[locale]/utils/cn";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useToast } from "../ui/Toast";

const SCHEDULE_ERRORS = ["invalidAnimal", "invalidWeek", "weekTaken"] as const;

/**
 * Contest management: plan species for coming weeks, preselect this week's
 * entries, veto a published winner, and run the daily job on demand.
 */
export default function ContestAdmin({ data }: { data: ContestAdminData }) {
  const t = useTranslations("Admin.contests");
  const format = useFormatter();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [species, setSpecies] = useState("");
  const [week, setWeek] = useState(data.weeks.find((w) => !data.scheduled.some((c) => c.weekStart === w)) ?? data.weeks[0]);

  const weekLabel = (weekStart: string) =>
    format.dateTime(new Date(`${weekStart}T00:00:00Z`), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  async function run(key: string, action: () => Promise<{ success: boolean; error: string | null }>, done: string) {
    setBusy(key);
    try {
      const res = await action();
      if (!res.success) {
        const code = SCHEDULE_ERRORS.find((error) => error === res.error);
        toast(t(code ? `errors.${code}` : res.error === "imageChanged" ? "errors.imageChanged" : "errors.failed"), "error");
        return;
      }
      toast(done);
      router.refresh();
    } catch (error) {
      console.error("Contest admin action failed:", error);
      toast(t("errors.failed"), "error");
    } finally {
      setBusy(null);
    }
  }

  function schedule() {
    const animal = data.animals.find((a) => a.name.toLowerCase() === species.trim().toLowerCase());
    if (!animal) return toast(t("errors.invalidAnimal"), "error");
    void run("schedule", () => scheduleContest(animal.id, week), t("toast.scheduled"));
    setSpecies("");
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-fg-muted">{t("hint")}</p>
        <Button
          variant="secondary"
          icon={<FastForward />}
          loading={busy === "advance"}
          disabled={busy !== null}
          onClick={() => void run("advance", advanceContestsNow, t("toast.advanced"))}
        >
          {t("advance")}
        </Button>
      </section>

      <section aria-labelledby="admin-contest-schedule" className="flex flex-col gap-3">
        <h2 id="admin-contest-schedule" className="text-lg font-semibold sm:text-xl">
          {t("scheduleTitle")}
        </h2>
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">{t("species")}</span>
            <input
              list="contest-species"
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
              placeholder={t("speciesPlaceholder")}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <datalist id="contest-species">
              {data.animals.map((animal) => (
                <option key={animal.id} value={animal.name} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("week")}</span>
            <select
              value={week}
              onChange={(event) => setWeek(event.target.value)}
              className="h-10 rounded-lg border border-border bg-surface px-3 text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {data.weeks.map((w) => (
                <option key={w} value={w} disabled={data.scheduled.some((c) => c.weekStart === w)}>
                  {t("weekOf", { date: weekLabel(w) })}
                </option>
              ))}
            </select>
          </label>
          <Button icon={<EventAvailable />} loading={busy === "schedule"} disabled={busy !== null || !species} onClick={schedule}>
            {t("schedule")}
          </Button>
        </Card>
        {data.scheduled.length === 0 ? (
          <p className="text-sm text-fg-muted">{t("noneScheduled")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.scheduled.map((contest) => (
              <Card as="li" key={contest.id} padding="sm" className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span lang="de" className="block truncate font-medium">
                    {contest.animal?.commonName}
                  </span>
                  <span className="text-xs text-fg-muted">{t("weekOf", { date: weekLabel(contest.weekStart) })}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Delete />}
                  loading={busy === contest.id}
                  disabled={busy !== null}
                  onClick={() => void run(contest.id, () => unscheduleContest(contest.id), t("toast.unscheduled"))}
                >
                  {t("unschedule")}
                </Button>
              </Card>
            ))}
          </ul>
        )}
        <p className="text-xs text-fg-subtle">{t("autoPickHint")}</p>
      </section>

      <section aria-labelledby="admin-contest-entries" className="flex flex-col gap-3">
        <h2 id="admin-contest-entries" className="text-lg font-semibold sm:text-xl">
          {data.submission
            ? t("entriesTitle", { name: data.submission.animal?.commonName ?? "" })
            : t("entriesTitleNone")}
        </h2>
        {data.submission && (
          <>
            <p className="text-sm text-fg-muted">{t("excludeHint")}</p>
            {data.submission.entries.length === 0 ? (
              <p className="text-sm text-fg-muted">{t("noEntries")}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {data.submission.entries.map((entry) => (
                  <Card
                    as="li"
                    key={entry.id}
                    padding="none"
                    className={cn("flex flex-col overflow-hidden", entry.status === "excluded" && "opacity-60")}
                  >
                    <span className="relative block aspect-[4/3] bg-surface-sunken">
                      {entry.thumbUrl && (
                        <Image src={entry.thumbUrl} alt="" fill unoptimized sizes="25vw" className="object-cover" />
                      )}
                    </span>
                    <span className="flex flex-col gap-2 p-3 text-sm">
                      <span className="truncate font-medium">{entry.username ?? "–"}</span>
                      <span className="text-xs text-fg-muted">{t(`entryStatus.${entry.status as "active"}`)}</span>
                      {(entry.status === "active" || entry.status === "excluded") && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={entry.status === "active" ? <Block /> : <CheckCircle />}
                          loading={busy === entry.id}
                          disabled={busy !== null}
                          onClick={() =>
                            void run(
                              entry.id,
                              () => setEntryExcluded(entry.id, entry.status === "active"),
                              t(entry.status === "active" ? "toast.excluded" : "toast.included"),
                            )
                          }
                        >
                          {entry.status === "active" ? t("exclude") : t("include")}
                        </Button>
                      )}
                    </span>
                  </Card>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="admin-contest-finished" className="flex flex-col gap-3">
        <h2 id="admin-contest-finished" className="text-lg font-semibold sm:text-xl">
          {t("finishedTitle")}
        </h2>
        {data.finished.length === 0 ? (
          <p className="text-sm text-fg-muted">{t("noneFinished")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.finished.map((contest) => (
              <Card as="li" key={contest.id} padding="sm" className="flex flex-wrap items-center gap-3">
                <span className="min-w-0 flex-1">
                  <Link href={`/contestpage/${contest.id}`} lang="de" className="block truncate font-medium hover:underline">
                    {contest.animal?.commonName}
                  </Link>
                  <span className="text-xs text-fg-muted">
                    {t("weekOf", { date: weekLabel(contest.weekStart) })}
                    {" · "}
                    {contest.winnerName ? t("wonBy", { name: contest.winnerName }) : t("noWinner")}
                    {contest.vetoed && ` · ${t("vetoed")}`}
                  </span>
                </span>
                {contest.published && !contest.vetoed && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Undo />}
                    loading={busy === contest.id}
                    disabled={busy !== null}
                    onClick={() => void run(contest.id, () => revertContestWinner(contest.id), t("toast.vetoed"))}
                  >
                    {t("veto")}
                  </Button>
                )}
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
