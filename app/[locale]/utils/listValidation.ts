import type { TablesInsert } from "@/utils/supabase/types";
import { fail, ok, type ActionResult } from "./result";

export const MAX_LIST_TITLE = 80;
export const MAX_LIST_DESCRIPTION = 500;

type ListFields = Pick<
  TablesInsert<"animallists">,
  "title" | "description" | "is_public" | "has_location" | "lat" | "lng"
>;

/**
 * Normalises and bounds the user-editable list columns. Server actions are
 * public endpoints, so these limits cannot live only in the form.
 */
export function validateListFields(input: {
  title: string;
  description: string;
  publicList: boolean;
  lat?: number | null;
  lng?: number | null;
}): ActionResult<ListFields> {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";

  if (title.length === 0) return fail("Title is required");
  if (title.length > MAX_LIST_TITLE) return fail("Title is too long");
  if (description.length > MAX_LIST_DESCRIPTION) return fail("Description is too long");
  if (typeof input.publicList !== "boolean") return fail("Invalid visibility");

  const hasLocation = input.lat != null && input.lng != null;
  if (
    hasLocation &&
    !(
      Number.isFinite(input.lat) &&
      Number.isFinite(input.lng) &&
      Math.abs(input.lat!) <= 90 &&
      Math.abs(input.lng!) <= 180
    )
  ) {
    return fail("Invalid location");
  }

  return ok({
    title,
    description,
    is_public: input.publicList,
    ...(input.lat === undefined
      ? {}
      : {
          has_location: hasLocation,
          lat: hasLocation ? input.lat! : null,
          lng: hasLocation ? input.lng! : null,
        }),
  });
}
