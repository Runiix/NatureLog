"use client";

import { ArrowForward, Cancel, CheckCircle } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import getQuizAnimals, { type QuizRound } from "@/app/[locale]/actions/home/getQuizAnimals";
import black from "@/app/[locale]/assets/images/black.webp";
import { cn } from "@/app/[locale]/utils/cn";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { Skeleton } from "../ui/Skeleton";

/** Case-, accent- and whitespace-insensitive comparison for typed answers. */
const normalise = (value: string) =>
  value
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Easy mode: four names to pick from, marked right/wrong once one is picked. */
function ChoiceGrid({
  round,
  answerId,
  picked,
  answered,
  onPick,
}: {
  round: QuizRound | null;
  answerId: number | undefined;
  picked: number | null;
  answered: boolean;
  onPick: (id: number) => void;
}) {
  const t = useTranslations("Home.quiz");
  return (
    <div role="group" aria-label={t("choicesLabel")} className="grid grid-cols-2 gap-2">
      {round
        ? round.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={answered}
            onClick={() => onPick(choice.id)}
            aria-pressed={picked === choice.id}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-center text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default",
              !answered && "border-border-muted hover:border-accent",
              answered && choice.id === answerId && "border-accent bg-accent/10 font-medium text-accent-text",
              answered && picked === choice.id && choice.id !== answerId && "border-danger bg-danger/10 text-danger",
              answered && picked !== choice.id && choice.id !== answerId && "border-border-muted opacity-60",
            )}
          >
            {answered && choice.id === answerId && <CheckCircle fontSize="small" aria-hidden />}
            {answered && picked === choice.id && choice.id !== answerId && (
              <Cancel fontSize="small" aria-hidden />
            )}
            {choice.common_name}
          </button>
        ))
        : Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-10" />)}
    </div>
  );
}

/** Hard mode: type the name, then check it. Locked once it is right. */
function TypedAnswer({
  value,
  loaded,
  solved,
  onChange,
  onCheck,
}: {
  value: string;
  loaded: boolean;
  solved: boolean;
  onChange: (value: string) => void;
  onCheck: () => void;
}) {
  const t = useTranslations("Home.quiz");
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onCheck();
      }}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("answerPlaceholder")}
        aria-label={t("answerLabel")}
        disabled={!loaded || solved}
      />
      <Button type="submit" variant="secondary" disabled={!loaded || !value.trim()}>
        {t("check")}
      </Button>
    </form>
  );
}

export default function AnimalQuiz() {
  const t = useTranslations("Home.quiz");
  const [round, setRound] = useState<QuizRound | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [mode, setMode] = useState<"easy" | "hard">("easy");
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuizAnimals()
      .then((data) => {
        if (!cancelled) setRound(data);
      })
      .catch((error) => console.error("Error loading quiz:", error));
    return () => {
      cancelled = true;
    };
  }, [roundKey]);

  const next = () => {
    setRound(null);
    setPicked(null);
    setTyped("");
    setChecked(false);
    setRoundKey((key) => key + 1);
  };

  const answer = round?.choices.find((choice) => choice.id === round.answerId) ?? null;
  const answered = mode === "easy" ? picked !== null : checked;
  const correct =
    answer !== null &&
    (mode === "easy" ? picked === answer.id : normalise(typed) === normalise(answer.common_name));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div
          role="radiogroup"
          aria-label={t("modeLabel")}
          className="inline-flex rounded-lg border border-border bg-surface-sunken p-0.5"
        >
          {(["easy", "hard"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mode === option}
              onClick={() => {
                setMode(option);
                setPicked(null);
                setChecked(false);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                mode === option ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
              )}
            >
              {t(option)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-sunken">
        {round && answer ? (
          <Image
            src={answer.lexicon_link ?? black}
            alt={t("imageAlt")}
            fill
            unoptimized
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Skeleton className="absolute inset-0 rounded-none" />
        )}
      </div>

      {mode === "easy" ? (
        <ChoiceGrid
          round={round}
          answerId={answer?.id}
          picked={picked}
          answered={answered}
          onPick={setPicked}
        />
      ) : (
        <TypedAnswer
          value={typed}
          loaded={round !== null}
          solved={checked && correct}
          onChange={(value) => {
            setTyped(value);
            setChecked(false);
          }}
          onCheck={() => setChecked(true)}
        />
      )}

      <p aria-live="polite" className={cn("min-h-5 text-sm", correct ? "text-accent-text" : "text-danger")}>
        {answered && answer && (correct ? t("correct", { name: answer.common_name }) : t("wrong", { name: answer.common_name }))}
      </p>

      <Button
        variant={answered ? "primary" : "ghost"}
        icon={<ArrowForward />}
        iconPosition="end"
        onClick={next}
        className="mt-auto self-end"
      >
        {t("next")}
      </Button>
    </div>
  );
}
