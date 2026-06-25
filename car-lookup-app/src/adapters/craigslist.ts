/**
 * Confidence: high.
 * Last verified: live (search-engine confirmed) — "cta" is the correct Craigslist
 * section code for "cars & trucks for sale", and {region}.craigslist.org/search/cta
 * resolves correctly for the bundled region slugs (e.g. chicago, losangeles, sfbay).
 * Test query used: chicago.craigslist.org/search/cta.
 *
 * Craigslist has no unified/nationwide search — a region subdomain is mandatory.
 * Year/price params (auto_year_min/max, min_price/max_price) follow Craigslist's
 * long-standing filter convention; re-check if Craigslist changes its filter UI.
 */
import type { MarketplaceAdapter } from "./types";

export const craigslistAdapter: MarketplaceAdapter = {
  id: "craigslist",
  name: "Craigslist",
  requiresRegionSelect: true,
  buildUrl(query) {
    if (!query.craigslistRegion) return null;

    const params = new URLSearchParams();
    const keyword = [query.make, query.model].filter(Boolean).join(" ").trim();
    if (keyword) params.set("query", keyword);
    if (query.priceMin !== undefined) params.set("min_price", String(query.priceMin));
    if (query.priceMax !== undefined) params.set("max_price", String(query.priceMax));
    if (query.yearMin !== undefined) params.set("auto_year_min", String(query.yearMin));
    if (query.yearMax !== undefined) params.set("auto_year_max", String(query.yearMax));

    const qs = params.toString();
    const base = `https://${query.craigslistRegion}.craigslist.org/search/cta`;
    return qs ? `${base}?${qs}` : base;
  },
};
