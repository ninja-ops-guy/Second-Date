import { getSessionUser } from "@/lib/auth";
import { getStripe } from "@/lib/billing";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.stripeCustomerId) {
    return Response.json({ error: "No billing account was found." }, { status: 404 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Billing is not configured in this preview." }, { status: 503 });
  }

  try {
    const baseUrl = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/app`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return Response.json({ error: "We couldn't open billing right now. Please try again." }, { status: 502 });
  }
}
