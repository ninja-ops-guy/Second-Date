import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string) {
  let userId = subscription.metadata?.userId || fallbackUserId;
  if (!userId) {
    const [found] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeSubscriptionId, subscription.id))
      .limit(1);
    userId = found?.id;
  }
  if (!userId) return;

  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  const hasAccess = subscription.status === "active" || subscription.status === "trialing";

  await db
    .update(users)
    .set({
      plan: hasAccess ? "plus" : "free",
      subscriptionStatus: subscription.status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
    })
    .where(eq(users.id, userId));
}
