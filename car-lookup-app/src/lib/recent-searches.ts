import type { SavedSearch } from "@/types/car-search";

const STORAGE_KEY = "car-lookup-recent-searches";
const MAX_ENTRIES = 20;

export function loadRecentSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(entry: Omit<SavedSearch, "id" | "createdAt">): SavedSearch[] {
  const next: SavedSearch = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const updated = [next, ...loadRecentSearches()].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable (e.g. private browsing) — fail silently.
  }
  return updated;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
