import type { Tables } from "@/utils/supabase/database.types";

/**
 * The columns of an `animallists` row that the list pages select and pass
 * around. `title` and `description` are nullable in the database, so every
 * consumer has to cope with a list that has neither.
 */
type AnimalListSummary = Pick<
  Tables<"animallists">,
  "id" | "title" | "description" | "is_public"
>;

export default AnimalListSummary;
