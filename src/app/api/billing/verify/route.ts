import { getSessionUser } from "@/lib/auth";
import { getStripe, syncSubscription } from "@/lib/billing";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return Response.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== user.id || session.mode !== "subscription") {
      return Response.json({ error: "This checkout does not belong to your account." }, { status: 403 });
    }
    if (typeof session.subscription !== "string") {
      return Response.json({ error: "Subscription is not ready yet. Please refresh shortly." }, { status: 409 });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await syncSubscription(subscription, user.id);
    return Response.json({ plan: subscription.status === "active" || subscription.status === "trialing" ? "plus" : "free" });
  } catch (error) {
    console.error("Checkout verification error:", error);
    return Response.json({ error: "We couldn't verify checkout yet. Please refresh shortly." }, { status: 502 });
  }
}
