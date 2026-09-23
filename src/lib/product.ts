export const CATEGORIES = ["Food", "Beauty", "Wellness", "Home"] as const;
export type Category = (typeof CATEGORIES)[number];

export type ProductItem = {
  id: string;
  userId: string;
  name: string;
  category: string;
  openedAt: string;
  useWithinDays: number;
  note: string;
  status: string;
  isExample: boolean;
  completedAt: string | null;
  createdAt: string;
};

export const FREE_ITEM_LIMIT = 8;

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function calendarDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysLeft(openedAt: string, useWithinDays: number, today = todayISO()) {
  return useWithinDays - Math.round((calendarDay(today) - calendarDay(openedAt)) / 86_400_000);
}

export function endDate(openedAt: string, useWithinDays: number) {
  const date = new Date(calendarDay(openedAt) + useWithinDays * 86_400_000);
  return date.toISOString().slice(0, 10);
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function remainingLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} past`;
  if (days === 0) return "Today";
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

export function itemEmoji(name: string, category: string) {
  const value = name.toLowerCase();
  if (value.includes("pesto") || value.includes("basil")) return "🌿";
  if (value.includes("milk")) return "🥛";
  if (value.includes("tahini") || value.includes("butter")) return "🥜";
  if (value.includes("coffee")) return "☕";
  if (value.includes("yogurt")) return "🥣";
  if (value.includes("cheese")) return "🧀";
  if (value.includes("jam")) return "🍓";
  if (value.includes("sauce")) return "🍅";
  if (value.includes("serum") || value.includes("cream")) return "🧴";
  if (value.includes("vitamin") || value.includes("supplement")) return "💊";
  if (value.includes("soap") || value.includes("cleaner")) return "🫧";
  const fallbacks: Record<string, string> = {
    Food: "🍋",
    Beauty: "✨",
    Wellness: "🌱",
    Home: "🧼",
  };
  return fallbacks[category] ?? "📦";
}

export function categoryTone(category: string) {
  const tones: Record<string, string> = {
    Food: "food",
    Beauty: "beauty",
    Wellness: "wellness",
    Home: "home",
  };
  return tones[category] ?? "food";
}
