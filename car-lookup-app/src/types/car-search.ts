export interface CarSearchQuery {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  zip?: string;
  radiusMiles?: number;
  priceMin?: number;
  priceMax?: number;
  /** Required by the Craigslist adapter only — its subdomain region slug. */
  craigslistRegion?: string;
}

export interface SavedSearch {
  id: string;
  query: CarSearchQuery;
  marketplaceIds: string[];
  createdAt: string;
}
