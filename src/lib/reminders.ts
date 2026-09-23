import { daysLeft, endDate, type ProductItem } from "@/lib/product";

export const REMINDER_LEAD_OPTIONS = [1, 2, 3, 7] as const;
export type ReminderLeadDays = (typeof REMINDER_LEAD_OPTIONS)[number];

export type ReminderItem = Pick<ProductItem, "id" | "name" | "category" | "openedAt" | "useWithinDays">;

export function isReminderLeadDays(value: unknown): value is ReminderLeadDays {
  return typeof value === "number" && REMINDER_LEAD_OPTIONS.includes(value as ReminderLeadDays);
}

export function reminderCandidates(items: ReminderItem[], leadDays: number, today?: string) {
  return items
    .map((item) => ({ ...item, remaining: daysLeft(item.openedAt, item.useWithinDays, today) }))
    .filter((item) => item.remaining === leadDays || item.remaining === 0)
    .sort((a, b) => a.remaining - b.remaining || a.name.localeCompare(b.name));
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

export function buildReminderEmail(items: ReturnType<typeof reminderCandidates>) {
  const subject = items.some((item) => item.remaining === 0)
    ? "A Second Date is here today"
    : `A Second Date is coming up for ${items.length === 1 ? items[0].name : `${items.length} things`}`;

  const rows = items.map((item) => {
    const timing = item.remaining === 0 ? "today" : `in ${item.remaining} day${item.remaining === 1 ? "" : "s"}`;
    return `<li style="margin:0 0 12px"><strong>${escapeHtml(item.name)}</strong> · ${escapeHtml(item.category)}<br><span style="color:#6f7f70">Second Date ${timing} · ${endDate(item.openedAt, item.useWithinDays)}</span></li>`;
  }).join("");

  return {
    subject,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#263328;background:#f6f5ef;padding:24px"><div style="max-width:560px;margin:auto;background:#fffefa;border:1px solid #e8ebe3;border-radius:14px;padding:28px"><div style="font-family:Georgia,serif;font-size:26px;margin-bottom:8px">second date. ✳</div><p style="color:#6f7f70;line-height:1.6">A little nudge for the things worth using next.</p><ul style="padding-left:20px;line-height:1.5">${rows}</ul><p style="font-size:12px;color:#8a988b;line-height:1.5;margin-top:24px">These dates are based on periods you entered. Always follow product instructions and storage guidance.</p></div></body></html>`,
  };
}

export async function sendReminderEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Reminder email delivery is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Reminder email delivery failed (${response.status}): ${body.slice(0, 300)}`);
  }
}
