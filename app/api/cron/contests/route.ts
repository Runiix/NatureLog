import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { advanceContests } from "@/utils/contest/advanceContests";

// Always run on request; the job reads the clock and the database.
export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron (vercel.json) that moves the photo contests along. Vercel
 * sends `Authorization: Bearer $CRON_SECRET`; anything else is refused, so the
 * job cannot be triggered from outside.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await advanceContests();
    revalidatePath("/", "layout");
    return NextResponse.json(report);
  } catch (error) {
    console.error("Advancing contests failed", error);
    return NextResponse.json({ error: "Advancing contests failed" }, { status: 500 });
  }
}
