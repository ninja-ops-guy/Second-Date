import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { createGuestAccount, getSessionUser, publicUser } from "@/lib/auth";
import { FREE_ITEM_LIMIT } from "@/lib/product";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = (await getSessionUser()) ?? (await createGuestAccount());
  const savedItems = await db
    .select()
    .from(items)
    .where(eq(items.userId, user.id))
    .orderBy(desc(items.createdAt));

  return Response.json(
    { user: publicUser(user), items: savedItems, limit: FREE_ITEM_LIMIT },
    { headers: { "Cache-Control": "no-store" } },
  );
}
