import { useCallback, useState } from "react";
import type { SavedSearch } from "@/types/car-search";
import { clearRecentSearches, loadRecentSearches, saveRecentSearch } from "@/lib/recent-searches";

export function useRecentSearches() {
  const [items, setItems] = useState<SavedSearch[]>(() => loadRecentSearches());

  const addSearch = useCallback((entry: Omit<SavedSearch, "id" | "createdAt">) => {
    setItems(saveRecentSearch(entry));
  }, []);

  const clearAll = useCallback(() => {
    clearRecentSearches();
    setItems([]);
  }, []);

  return { items, addSearch, clearAll };
}
