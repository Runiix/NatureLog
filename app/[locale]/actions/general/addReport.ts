"use server";

import requireAuth from "@/utils/supabase/requireAuth";
import { fail, ok } from "@/app/[locale]/utils/result";

const MAX_REPORT_TEXT = 1000;

// `reportedUserId` is the owner of the reported image, not the reporter.
export default async function addReport(
  reportedUserId: string,
  imageLink: string,
  reportText: string,
) {
  const { supabase } = await requireAuth();

  const text = typeof reportText === "string" ? reportText.trim() : "";
  if (text.length > MAX_REPORT_TEXT) return fail("Report is too long");
  if (typeof imageLink !== "string" || imageLink.length === 0 || imageLink.length > 2048) {
    return fail("Invalid image");
  }

  const { error } = await supabase
    .from("reports")
    .insert({ image_link: imageLink, user_id: reportedUserId, report_text: text });
  if (error) {
    console.error("Error adding new report", error);
    return fail(error.message);
  }
  return ok();
}
