import { getSessionUser } from "@/lib/auth";
import { getStripe } from "@/lib/billing";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Refresh the page and try again." }, { status: 401 });
  if (!user.email) {
    return Response.json({ error: "Create a free account before upgrading.", code: "ACCOUNT_REQUIRED" }, { status: 403 });
  }
  if (user.plan === "plus") {
    return Response.json({ error: "You're already enjoying Plus." }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: "Checkout is not connected in this preview. Add Stripe keys to accept subscriptions." },
      { status: 503 },
    );
  }

  let body: { interval?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // The default monthly plan is used when no body is sent.
  }
  const interval = body.interval === "year" ? "year" : "month";
  const amount = interval === "year" ? 2400 : 299;
  const baseUrl = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            recurring: { interval },
            product_data: {
              name: "Second Date Plus",
              description: "Unlimited open-date timers, printable labels, and use-up insights.",
            },
          },
          quantity: 1,
        },
      ],
      ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app?checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    await trackEvent(user.id, "checkout_started", { interval });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "We couldn't start checkout right now. Please try again." }, { status: 502 });
  }
}
