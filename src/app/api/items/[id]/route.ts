import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { items } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { rejectUntrustedBrowserMutation } from "@/lib/request-security";
import { validateItemInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

async function getOwnedItem(id: string, userId: string) {
  const [item] = await db.select().from(items).where(and(eq(items.id, id), eq(items.userId, userId))).limit(1);
  return item;
}
function validId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function PATCH(request: Request, context: Context) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Your session expired. Refresh the page and try again." }, { status: 401 });
  const { id } = await context.params;
  if (!validId(id) || !(await getOwnedItem(id, user.id))) return Response.json({ error: "Item not found." }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  if (body && typeof body === "object" && "status" in body) {
    const status = (body as { status: unknown }).status;
    if (status !== "used" && status !== "discarded") return Response.json({ error: "Invalid status." }, { status: 400 });
    const [item] = await db.update(items).set({ status, completedAt: new Date() }).where(and(eq(items.id, id), eq(items.userId, user.id))).returning();
    await trackEvent(user.id, status === "used" ? "item_used" : "item_discarded", { category: item.category });
    return Response.json({ item });
  }

  const result = validateItemInput(body);
  if (!result.success) return Response.json({ error: result.error }, { status: 400 });
  const [item] = await db.update(items).set(result.value).where(and(eq(items.id, id), eq(items.userId, user.id))).returning();
  return Response.json({ item });
}

export async function DELETE(request: Request, context: Context) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Your session expired. Refresh the page and try again." }, { status: 401 });
  const { id } = await context.params;
  if (!validId(id)) return Response.json({ error: "Item not found." }, { status: 404 });
  const removed = await db.delete(items).where(and(eq(items.id, id), eq(items.userId, user.id))).returning({ id: items.id });
  if (!removed.length) return Response.json({ error: "Item not found." }, { status: 404 });
  return Response.json({ ok: true });
}
