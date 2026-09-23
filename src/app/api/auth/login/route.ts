import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, publicUser, verifyPassword } from "@/lib/auth";
import { rejectUntrustedBrowserMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (!email || typeof password !== "string") {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "That email and password don't match." }, { status: 401 });
  }

  await createSession(user.id);
  return Response.json({ user: publicUser(user) });
}
