import type { CarSearchQuery } from "@/types/car-search";

export interface MarketplaceAdapter {
  id: string;
  name: string;
  colorClass?: string;
  /** Returns a fully-qualified search URL, or null if the query has nothing usable for this site. */
  buildUrl: (query: CarSearchQuery) => string | null;
  requiresRegionSelect?: boolean;
}

/** Joins year/make/model into a free-text search term for sites without reliable structured filters. */
export function buildKeyword(query: CarSearchQuery): string {
  return [query.yearMin, query.make, query.model]
    .filter((part) => part !== undefined && part !== null && part !== "")
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");
}
