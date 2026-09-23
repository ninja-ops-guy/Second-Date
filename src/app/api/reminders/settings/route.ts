import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, publicUser } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { isReminderLeadDays } from "@/lib/reminders";
import { rejectUntrustedBrowserMutation } from "@/lib/request-security";

export async function PATCH(request: Request) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Your session expired. Refresh the page and try again." }, { status: 401 });
  if (!user.email) return Response.json({ error: "Create an account before enabling email reminders." }, { status: 403 });
  if (user.plan !== "plus") return Response.json({ error: "Email reminders are part of Second Date Plus." }, { status: 403 });

  let body: { enabled?: unknown; leadDays?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  if (typeof body.enabled !== "boolean" || !isReminderLeadDays(body.leadDays)) {
    return Response.json({ error: "Choose a valid reminder setting." }, { status: 400 });
  }

  const [updated] = await db.update(users)
    .set({ reminderEmailEnabled: body.enabled, reminderLeadDays: body.leadDays })
    .where(eq(users.id, user.id)).returning();

  if (body.enabled !== user.reminderEmailEnabled) {
    await trackEvent(user.id, body.enabled ? "reminders_enabled" : "reminders_disabled", { leadDays: body.leadDays });
  }
  return Response.json({ user: publicUser(updated) });
}
