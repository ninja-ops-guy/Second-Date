import assert from "node:assert/strict";
import test from "node:test";
import { validateItemInput } from "./validation";

const valid = {
  name: "Basil pesto",
  category: "Food",
  openedAt: "2026-09-20",
  useWithinDays: 7,
  note: "Pasta night",
};

test("validateItemInput accepts a valid item and trims text", () => {
  const result = validateItemInput({ ...valid, name: "  Basil pesto  ", note: "  Pasta night  " });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.value.name, "Basil pesto");
    assert.equal(result.value.note, "Pasta night");
  }
});

test("validateItemInput rejects impossible and future dates", () => {
  assert.equal(validateItemInput({ ...valid, openedAt: "2026-02-30" }).success, false);
  assert.equal(validateItemInput({ ...valid, openedAt: "2999-01-01" }).success, false);
});

test("validateItemInput rejects invalid categories and duration bounds", () => {
  assert.equal(validateItemInput({ ...valid, category: "Garage" }).success, false);
  assert.equal(validateItemInput({ ...valid, useWithinDays: 0 }).success, false);
  assert.equal(validateItemInput({ ...valid, useWithinDays: 3651 }).success, false);
});

test("validateItemInput caps notes", () => {
  assert.equal(validateItemInput({ ...valid, note: "x".repeat(241) }).success, false);
});
