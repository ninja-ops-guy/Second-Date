import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  if (user.plan !== "plus") {
    return Response.json({ error: "Printable label sheets are part of Plus." }, { status: 403 });
  }

  const labels = await db
    .select({
      id: items.id,
      name: items.name,
      category: items.category,
      openedAt: items.openedAt,
      useWithinDays: items.useWithinDays,
    })
    .from(items)
    .where(and(eq(items.userId, user.id), eq(items.status, "active")))
    .orderBy(asc(items.createdAt));

  return Response.json({ labels }, { headers: { "Cache-Control": "no-store" } });
}
