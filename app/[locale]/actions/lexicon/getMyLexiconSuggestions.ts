"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import type { Tables } from "@/utils/supabase/types";

export type MySuggestion = Pick<
  Tables<"lexicon_submissions">,
  "id" | "kind" | "status" | "review_note" | "created_at" | "reviewed_at"
> & {
  /** The existing animal's name, or the proposed name of a new one. */
  animalName: string | null;
};

const LIMIT = 50;

/** The caller's own proposals, newest first. RLS returns only their rows. */
export default async function getMyLexiconSuggestions(): Promise<MySuggestion[]> {
  const { supabase, user } = await requireAuth();

  const { data, error } = await supabase
    .from("lexicon_submissions")
    .select("id, kind, status, review_note, created_at, reviewed_at, data, animals(common_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (error) {
    console.error("Error loading lexicon suggestions", error);
    return [];
  }

  return data.map(({ data: proposed, animals, ...row }) => {
    const proposedName =
      proposed && typeof proposed === "object" && !Array.isArray(proposed)
        ? proposed.common_name
        : null;
    return {
      ...row,
      animalName: animals?.common_name ?? (typeof proposedName === "string" ? proposedName : null),
    };
  });
}
