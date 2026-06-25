/**
 * Confidence: medium-high — makeCode/modelCode/startYear/endYear/zip/searchRadius
 * param names are corroborated by third-party scraper tooling, but exact path-segment
 * structure and casing should be spot-checked against a live search.
 * Last verified: not live-tested (search-confirmed param names only).
 * Test query to use when verifying: make=Toyota, model=Camry, zip=94110.
 *
 * AutoTrader embeds make/model/zip as path segments; if make is missing we fall
 * back to a zip-only (or fully unfiltered) search rather than building a broken path.
 */
import type { MarketplaceAdapter } from "./types";
import { slugify } from "./slugify";

export const autoTraderAdapter: MarketplaceAdapter = {
  id: "autotrader",
  name: "AutoTrader",
  buildUrl(query) {
    const { make, model, zip, radiusMiles, yearMin, yearMax, priceMin, priceMax } = query;
    if (!make && !zip) return null;

    const segments = ["all-cars"];
    if (make) {
      segments.push(slugify(make));
      if (model) segments.push(slugify(model));
    }
    if (zip) segments.push(zip);

    const params = new URLSearchParams();
    if (radiusMiles !== undefined) params.set("searchRadius", String(radiusMiles));
    if (yearMin !== undefined) params.set("startYear", String(yearMin));
    if (yearMax !== undefined) params.set("endYear", String(yearMax));
    if (priceMin !== undefined) params.set("minPrice", String(priceMin));
    if (priceMax !== undefined) params.set("maxPrice", String(priceMax));

    const qs = params.toString();
    return `https://www.autotrader.com/cars-for-sale/${segments.join("/")}${qs ? `?${qs}` : ""}`;
  },
};
