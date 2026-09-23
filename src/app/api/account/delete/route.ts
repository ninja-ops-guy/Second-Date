import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { destroySession, getSessionUser, verifyPassword } from "@/lib/auth";
import { getStripe } from "@/lib/billing";

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user?.email || !user.passwordHash) return Response.json({ error: "Sign in to delete your account." }, { status: 401 });

  let body: { password?: unknown; confirmation?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (body.confirmation !== "DELETE") return Response.json({ error: 'Type "DELETE" to confirm.' }, { status: 400 });
  if (typeof body.password !== "string" || !(await verifyPassword(body.password, user.passwordHash))) {
    return Response.json({ error: "Your password did not match." }, { status: 403 });
  }

  if (user.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      if (subscription.status !== "canceled") await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      console.error("Account deletion could not cancel Stripe subscription:", error);
      return Response.json({ error: "We could not cancel your active subscription. Your account was not deleted." }, { status: 502 });
    }
  }

  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  return Response.json({ ok: true });
}
