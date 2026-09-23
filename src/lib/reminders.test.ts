import assert from "node:assert/strict";
import test from "node:test";
import { buildReminderEmail, escapeHtml, isReminderLeadDays, reminderCandidates } from "./reminders";

const items = [
  { id: "1", name: "Pesto <jar>", category: "Food", openedAt: "2026-09-18", useWithinDays: 7 },
  { id: "2", name: "Oat milk", category: "Food", openedAt: "2026-09-15", useWithinDays: 7 },
  { id: "3", name: "Serum", category: "Beauty", openedAt: "2026-09-01", useWithinDays: 90 },
  { id: "4", name: "Old sauce", category: "Food", openedAt: "2026-09-01", useWithinDays: 10 },
];

test("reminderCandidates sends at the configured lead day and on the due date", () => {
  const due = reminderCandidates(items, 3, "2026-09-22");
  assert.deepEqual(due.map((item) => [item.id, item.remaining]), [["2", 0], ["1", 3]]);
});

test("reminderCandidates excludes far-away and already-past items", () => {
  const due = reminderCandidates(items, 7, "2026-09-22");
  assert.deepEqual(due.map((item) => item.id), ["2"]);
});

test("email rendering escapes user-controlled item names", () => {
  assert.equal(escapeHtml('<script>"x"</script>'), "&lt;script&gt;&quot;x&quot;&lt;/script&gt;");
  const message = buildReminderEmail(reminderCandidates(items, 3, "2026-09-22"));
  assert.equal(message.html.includes("<jar>"), false);
  assert.equal(message.html.includes("Pesto &lt;jar&gt;"), true);
});

test("reminder lead time only accepts supported values", () => {
  assert.equal(isReminderLeadDays(1), true);
  assert.equal(isReminderLeadDays(7), true);
  assert.equal(isReminderLeadDays(4), false);
  assert.equal(isReminderLeadDays("3"), false);
});
