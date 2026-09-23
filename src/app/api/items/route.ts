import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { FREE_ITEM_LIMIT } from "@/lib/product";
import { rejectUntrustedBrowserMutation } from "@/lib/request-security";
import { validateItemInput } from "@/lib/validation";

export async function POST(request: Request) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Your session expired. Refresh the page and try again." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validateItemInput(body);
  if (!result.success) return Response.json({ error: result.error }, { status: 400 });

  if (user.plan !== "plus") {
    const [row] = await db
      .select({ total: count() })
      .from(items)
      .where(and(eq(items.userId, user.id), eq(items.status, "active"), eq(items.isExample, false)));

    if (row.total >= FREE_ITEM_LIMIT) {
      return Response.json(
        { error: `Your free space holds ${FREE_ITEM_LIMIT} open items. Finish one or upgrade for unlimited space.`, code: "LIMIT_REACHED" },
        { status: 403 },
      );
    }
  }

  await db.delete(items).where(and(eq(items.userId, user.id), eq(items.isExample, true)));
  const [item] = await db.insert(items).values({ userId: user.id, ...result.value }).returning();
  await trackEvent(user.id, "item_created", { category: item.category });
  return Response.json({ item }, { status: 201 });
}
