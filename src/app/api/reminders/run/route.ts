import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { items, reminderDigests, users } from "@/db/schema";
import { trackEvent } from "@/lib/analytics";
import { todayISO } from "@/lib/product";
import { buildReminderEmail, reminderCandidates, sendReminderEmail } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.REMINDER_FROM_EMAIL) {
    return Response.json({ error: "Reminder email delivery is not configured." }, { status: 503 });
  }

  const today = todayISO();
  const reminderUsers = await db
    .select({ id: users.id, email: users.email, leadDays: users.reminderLeadDays })
    .from(users)
    .where(and(eq(users.reminderEmailEnabled, true), eq(users.plan, "plus")));

  let sent = 0;
  let skipped = 0;
  const failures: Array<{ userId: string; error: string }> = [];

  for (const user of reminderUsers) {
    if (!user.email) {
      skipped += 1;
      continue;
    }

    const activeItems = await db
      .select({
        id: items.id,
        name: items.name,
        category: items.category,
        openedAt: items.openedAt,
        useWithinDays: items.useWithinDays,
      })
      .from(items)
      .where(and(eq(items.userId, user.id), eq(items.status, "active"), eq(items.isExample, false)));

    const due = reminderCandidates(activeItems, user.leadDays, today);
    if (!due.length) {
      skipped += 1;
      continue;
    }

    let reservationId: string | null = null;
    try {
      const [reservation] = await db
        .insert(reminderDigests)
        .values({ userId: user.id, reminderDate: today, itemCount: due.length })
        .onConflictDoNothing()
        .returning({ id: reminderDigests.id });
      if (!reservation) {
        skipped += 1;
        continue;
      }
      reservationId = reservation.id;

      const message = buildReminderEmail(due);
      await sendReminderEmail(user.email, message.subject, message.html);
      await trackEvent(user.id, "reminder_digest_sent", { itemCount: due.length, leadDays: user.leadDays });
      sent += 1;
    } catch (error) {
      if (reservationId) {
        await db.delete(reminderDigests).where(eq(reminderDigests.id, reservationId)).catch(() => undefined);
      }
      failures.push({ userId: user.id, error: error instanceof Error ? error.message : "Unknown reminder failure" });
    }
  }

  return Response.json({ ok: failures.length === 0, date: today, sent, skipped, failures }, { status: failures.length ? 207 : 200 });
}
