import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents, items, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.email) return Response.json({ error: "Sign in to export your data." }, { status: 401 });

  const [account] = await db.select({
    id: users.id,
    email: users.email,
    plan: users.plan,
    subscriptionStatus: users.subscriptionStatus,
    reminderEmailEnabled: users.reminderEmailEnabled,
    reminderLeadDays: users.reminderLeadDays,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, user.id)).limit(1);

  const savedItems = await db.select().from(items).where(eq(items.userId, user.id)).orderBy(desc(items.createdAt));
  const events = await db.select({
    event: analyticsEvents.event,
    metadata: analyticsEvents.metadata,
    createdAt: analyticsEvents.createdAt,
  }).from(analyticsEvents).where(eq(analyticsEvents.userId, user.id)).orderBy(desc(analyticsEvents.createdAt));

  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), account, items: savedItems, events }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="second-date-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
