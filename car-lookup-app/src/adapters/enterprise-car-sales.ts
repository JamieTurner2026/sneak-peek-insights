/**
 * Confidence: low — least documented of the 6 sites, and live verification was
 * blocked by anti-bot protection during implementation.
 * Last verified: not live-tested. Test query to use when verifying:
 * make=Toyota, model=Camry, zip=94110.
 *
 * Falls back to the all-inventory search page with query params whenever the
 * make/model path segments can't be confirmed, rather than guessing a path
 * structure that could 404. Re-verify by performing a real search on
 * enterprisecarsales.com and copying the resulting URL before relying on this
 * for anything beyond a "best effort" link.
 */
import type { MarketplaceAdapter } from "./types";

export const enterpriseCarSalesAdapter: MarketplaceAdapter = {
  id: "enterprise-car-sales",
  name: "Enterprise Car Sales",
  buildUrl(query) {
    const { make, model, zip, radiusMiles, priceMin, priceMax, yearMin, yearMax } = query;
    if (!make && !model && !zip) return null;

    const params = new URLSearchParams();
    const keyword = [make, model].filter(Boolean).join(" ").trim();
    if (keyword) params.set("keyword", keyword);
    if (zip) params.set("location", zip);
    if (radiusMiles !== undefined) params.set("radius", String(radiusMiles));
    if (priceMin !== undefined) params.set("minPrice", String(priceMin));
    if (priceMax !== undefined) params.set("maxPrice", String(priceMax));
    if (yearMin !== undefined) params.set("yearMin", String(yearMin));
    if (yearMax !== undefined) params.set("yearMax", String(yearMax));

    const qs = params.toString();
    return `https://www.enterprisecarsales.com/used-cars.html${qs ? `?${qs}` : ""}`;
  },
};
