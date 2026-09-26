"use client";

import { Inbox, Undo } from "@mui/icons-material";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import withdrawLexiconSuggestion from "../../actions/lexicon/withdrawLexiconSuggestion";
import type { MySuggestion } from "../../actions/lexicon/getMyLexiconSuggestions";
import { cn } from "@/app/[locale]/utils/cn";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { useToast } from "../ui/Toast";

type Kind = "description" | "image" | "new_animal";
type Status = "pending" | "approved" | "rejected";

const STATUS_TONES: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  approved: "bg-green-600/15 text-green-700 dark:text-green-300",
  rejected: "bg-danger/15 text-danger",
};

/** The user's own proposals and what became of them. */
export default function MySuggestions({ suggestions }: { suggestions: MySuggestion[] }) {
  const t = useTranslations("LexiconSuggest.mine");
  const tKind = useTranslations("LexiconSuggest.kind");
  const format = useFormatter();
  const toast = useToast();
  const [withdrawn, setWithdrawn] = useState<ReadonlySet<string>>(new Set());
  const items = suggestions.filter((item) => !withdrawn.has(item.id));
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function withdraw(id: string) {
    setBusy(id);
    startTransition(async () => {
      try {
        const res = await withdrawLexiconSuggestion(id);
        if (!res.success) throw new Error(res.error);
        setWithdrawn((current) => new Set(current).add(id));
        toast(t("withdrawn"));
      } catch (error) {
        console.error("Withdraw failed:", error);
        toast(t("error"), "error");
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <section aria-labelledby="my-suggestions" className="flex flex-col gap-4">
      <h2 id="my-suggestions" className="text-lg font-semibold text-fg sm:text-xl">
        {t("title")}
      </h2>
      {items.length === 0 ? (
        <EmptyState icon={<Inbox />} title={t("empty")} />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const status = item.status as Status;
            return (
              <Card as="li" key={item.id} className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-semibold text-fg">
                    {tKind(item.kind as Kind)}
                    {item.animalName && <span className="font-normal text-fg-muted"> · {item.animalName}</span>}
                  </p>
                  <p className="text-fg-subtle">
                    {format.dateTime(new Date(item.created_at), { dateStyle: "medium" })}
                  </p>
                  {item.review_note && (
                    <p className="text-fg-muted">{t("note", { note: item.review_note })}</p>
                  )}
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_TONES[status])}>
                  {t(`status.${status}`)}
                </span>
                {status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Undo />}
                    loading={busy === item.id}
                    disabled={busy !== null}
                    onClick={() => withdraw(item.id)}
                  >
                    {t("withdraw")}
                  </Button>
                )}
              </Card>
            );
          })}
        </ul>
      )}
    </section>
  );
}
