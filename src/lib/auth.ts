import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { items, sessions, users } from "@/db/schema";
import { trackEvent } from "@/lib/analytics";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "second_date_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const matches = await db
    .select()
    .from(users)
    .innerJoin(sessions, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return matches[0]?.users ?? null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_AGE_SECONDS * 1000),
  });

  (await cookies()).set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(COOKIE_NAME);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function createGuestAccount() {
  const [user] = await db.insert(users).values({ plan: "free" }).returning();

  await db.insert(items).values([
    {
      userId: user.id,
      name: "Basil pesto",
      category: "Food",
      openedAt: daysAgo(5),
      useWithinDays: 7,
      note: "A little pasta night inspiration.",
      isExample: true,
    },
    {
      userId: user.id,
      name: "Oat milk",
      category: "Food",
      openedAt: daysAgo(3),
      useWithinDays: 7,
      isExample: true,
    },
    {
      userId: user.id,
      name: "Vitamin C serum",
      category: "Beauty",
      openedAt: daysAgo(24),
      useWithinDays: 90,
      isExample: true,
    },
    {
      userId: user.id,
      name: "Tahini",
      category: "Food",
      openedAt: daysAgo(12),
      useWithinDays: 45,
      isExample: true,
    },
  ]);

  await createSession(user.id);
  await trackEvent(user.id, "guest_started");
  return user;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== 64) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(expected, actual);
}

export function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    reminderEmailEnabled: user.reminderEmailEnabled,
    reminderLeadDays: user.reminderLeadDays,
  };
}
