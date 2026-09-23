import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, getSessionUser, hashPassword, publicUser } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return Response.json({ error: "Use a password between 8 and 128 characters." }, { status: 400 });
  }

  const currentUser = await getSessionUser();
  if (currentUser?.email) {
    return Response.json({ error: "You're already signed in." }, { status: 400 });
  }
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return Response.json({ error: "An account with that email already exists. Sign in instead." }, { status: 409 });

  const passwordHash = await hashPassword(password);
  let user;
  if (currentUser) {
    [user] = await db.update(users).set({ email, passwordHash }).where(eq(users.id, currentUser.id)).returning();
  } else {
    [user] = await db.insert(users).values({ email, passwordHash }).returning();
    await createSession(user.id);
  }

  await trackEvent(user.id, "account_created");
  return Response.json({ user: publicUser(user) }, { status: 201 });
}
