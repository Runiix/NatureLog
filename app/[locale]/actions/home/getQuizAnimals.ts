"use server";

import { createClient } from "@/utils/supabase/server";

export type QuizChoice = { id: number; common_name: string; lexicon_link: string | null };
export type QuizRound = { choices: QuizChoice[]; answerId: number };

const CHOICES = 4;

/**
 * Four random animals with a picture, one of which is the answer. Only the
 * columns the quiz shows are returned (it used to send whole rows), and the
 * shuffle is a proper Fisher–Yates rather than sort(() => 0.5 - random).
 */
export default async function getQuizAnimals(): Promise<QuizRound | null> {
  const supabase = await createClient();
  const { data: ids, error } = await supabase
    .from("animals")
    .select("id")
    .not("lexicon_link", "is", null);
  if (error || !ids || ids.length < CHOICES) {
    console.error("Error loading quiz ids", error);
    return null;
  }

  const pool = ids.map((row) => row.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, CHOICES);

  const { data, error: animalsError } = await supabase
    .from("animals")
    .select("id, common_name, lexicon_link")
    .in("id", picked);
  if (animalsError || !data || data.length < CHOICES) {
    console.error("Error loading quiz animals", animalsError);
    return null;
  }

  const choices = picked
    .map((id) => data.find((animal) => animal.id === id))
    .filter((animal): animal is QuizChoice => animal !== undefined);
  return { choices, answerId: choices[Math.floor(Math.random() * choices.length)].id };
}
