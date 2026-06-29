/**
 * Confidence: medium-high — makes[]/models[]/zip/stock_type confirmed by community
 * reverse-engineering and scraper tooling; year_min/year_max/list_price_min/max and
 * the exact models[] format ("{make}-{model}" vs bare model) should be spot-checked.
 * Last verified: not live-tested (cars.com blocks automated fetches).
 * Test query to use when verifying: make=Toyota, model=Camry, zip=94110.
 */
import type { MarketplaceAdapter } from "./types";
import { slugify } from "./slugify";

export const carsDotComAdapter: MarketplaceAdapter = {
  id: "cars-dot-com",
  name: "Cars.com",
  buildUrl(query) {
    const { make, model, zip, radiusMiles, yearMin, yearMax, priceMin, priceMax } = query;
    if (!make && !model && !zip) return null;

    const params = new URLSearchParams();
    params.set("stock_type", "used");
    if (make) {
      const makeSlug = slugify(make);
      params.append("makes[]", makeSlug);
      if (model) params.append("models[]", `${makeSlug}-${slugify(model)}`);
    }
    if (zip) {
      params.set("zip", zip);
      if (radiusMiles !== undefined) params.set("maximum_distance", String(radiusMiles));
    }
    if (yearMin !== undefined) params.set("year_min", String(yearMin));
    if (yearMax !== undefined) params.set("year_max", String(yearMax));
    if (priceMin !== undefined) params.set("list_price_min", String(priceMin));
    if (priceMax !== undefined) params.set("list_price_max", String(priceMax));

    return `https://www.cars.com/shopping/results/?${params.toString()}`;
  },
};
