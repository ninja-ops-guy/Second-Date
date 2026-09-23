import { sql } from "drizzle-orm";
import { db } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = false;
  try {
    await db.execute(sql`select 1`);
    database = true;
  } catch {
    database = false;
  }

  const billing = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const reminders = Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL && process.env.CRON_SECRET);
  const appUrl = Boolean(process.env.APP_URL);
  const ready = database && appUrl;

  return Response.json(
    { ready, checks: { database, appUrl, billing, reminders } },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
