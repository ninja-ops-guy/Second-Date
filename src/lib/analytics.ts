import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

export type AnalyticsEvent =
  | "guest_started"
  | "account_created"
  | "item_created"
  | "item_used"
  | "item_discarded"
  | "checkout_started"
  | "reminders_enabled"
  | "reminders_disabled"
  | "reminder_digest_sent";

export async function trackEvent(
  userId: string,
  event: AnalyticsEvent,
  metadata: Record<string, string | number | boolean | null> = {},
) {
  try {
    await db.insert(analyticsEvents).values({
      userId,
      event,
      metadata: JSON.stringify(metadata),
    });
  } catch (error) {
    console.error("Analytics event write failed:", event, error);
  }
}
