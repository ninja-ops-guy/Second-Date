import { CATEGORIES, type Category } from "@/lib/product";

export function validateItemInput(input: unknown) {
  if (!input || typeof input !== "object") {
    return { success: false as const, error: "Please enter the item details." };
  }

  const data = input as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const category = data.category;
  const openedAt = data.openedAt;
  const useWithinDays = data.useWithinDays;
  const note = typeof data.note === "string" ? data.note.trim() : "";

  if (name.length < 2 || name.length > 80) {
    return { success: false as const, error: "Give your item a name between 2 and 80 characters." };
  }
  if (typeof category !== "string" || !CATEGORIES.includes(category as Category)) {
    return { success: false as const, error: "Choose a valid category." };
  }
  if (typeof openedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(openedAt)) {
    return { success: false as const, error: "Choose a valid opening date." };
  }
  const date = new Date(`${openedAt}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== openedAt) {
    return { success: false as const, error: "Choose a valid opening date." };
  }
  if (date.getTime() > Date.now() + 86_400_000) {
    return { success: false as const, error: "The opening date cannot be in the future." };
  }
  if (typeof useWithinDays !== "number" || !Number.isInteger(useWithinDays) || useWithinDays < 1 || useWithinDays > 3650) {
    return { success: false as const, error: "Enter a period from 1 to 3,650 days." };
  }
  if (note.length > 240) {
    return { success: false as const, error: "Keep your note under 240 characters." };
  }

  return {
    success: true as const,
    value: { name, category, openedAt, useWithinDays, note },
  };
}
