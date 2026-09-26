import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  // A no-op without a session, so there is nothing to check first.
  await supabase.auth.signOut();
  // Extract the locale from the current path
  const url = new URL(req.url);
  const locale = url.pathname.split("/")[1] || "de"; // fallback to 'de' if not found
  return NextResponse.redirect(new URL(`/${locale}`, req.url), {
    status: 302,
  });
}
