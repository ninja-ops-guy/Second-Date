import assert from "node:assert/strict";
import test from "node:test";
import { daysLeft, endDate, remainingLabel } from "./product";

test("daysLeft uses calendar days across month and DST boundaries", () => {
  assert.equal(daysLeft("2026-03-07", 7, "2026-03-10"), 4);
  assert.equal(daysLeft("2026-01-30", 7, "2026-02-02"), 4);
});

test("endDate handles leap years and month rollover", () => {
  assert.equal(endDate("2028-02-28", 1), "2028-02-29");
  assert.equal(endDate("2026-12-31", 1), "2027-01-01");
});

test("remainingLabel is human friendly at important boundaries", () => {
  assert.equal(remainingLabel(-1), "1 day past");
  assert.equal(remainingLabel(0), "Today");
  assert.equal(remainingLabel(1), "1 day left");
  assert.equal(remainingLabel(4), "4 days left");
});
