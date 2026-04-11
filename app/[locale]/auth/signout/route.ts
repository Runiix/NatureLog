import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }
  // Extract the locale from the current path
  const url = new URL(req.url);
  const locale = url.pathname.split("/")[1] || "de"; // fallback to 'de' if not found
  return NextResponse.redirect(new URL(`/${locale}`, req.url), {
    status: 302,
  });
}
