/**
 * Confidence: high (by design).
 * Last verified: not live-tested (Facebook requires an authenticated session to
 * confirm filter behavior) — pattern is the documented generic Marketplace search URL.
 * Test query used: "2020 Toyota Camry".
 *
 * Facebook Marketplace's category/filter URLs (minPrice, maxPrice, radius, lat/long)
 * are undocumented, session- and location-context-dependent, and silently no-op
 * without an active FB session. We deliberately stick to the one reliable pattern:
 * a free-text keyword search. Price/radius filtering is intentionally NOT attempted.
 */
import type { MarketplaceAdapter } from "./types";
import { buildKeyword } from "./types";

export const facebookMarketplaceAdapter: MarketplaceAdapter = {
  id: "facebook-marketplace",
  name: "Facebook Marketplace",
  buildUrl(query) {
    const keyword = buildKeyword(query);
    if (!keyword) return null;
    const params = new URLSearchParams({ query: keyword });
    return `https://www.facebook.com/marketplace/search/?${params.toString()}`;
  },
};
