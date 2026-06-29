/**
 * Confidence: medium — CarMax has gone through several site redesigns; param names
 * here are a best-known pattern (path segments for make/model, "search" for
 * zip/location, yearFrom/yearTo/priceFrom/priceTo for ranges) and should be
 * spot-checked against a live search before relying on them.
 * Last verified: not live-tested (carmax.com blocks automated fetches).
 * Test query to use when verifying: make=Toyota, model=Camry, zip=94110.
 */
import type { MarketplaceAdapter } from "./types";
import { slugify } from "./slugify";

export const carMaxAdapter: MarketplaceAdapter = {
  id: "carmax",
  name: "CarMax",
  buildUrl(query) {
    const { make, model, zip, radiusMiles, yearMin, yearMax, priceMin, priceMax } = query;
    if (!make && !zip) return null;

    const segments = ["cars"];
    if (make) {
      segments.push(slugify(make));
      if (model) segments.push(slugify(model));
    }

    const params = new URLSearchParams();
    if (zip) params.set("search", zip);
    if (radiusMiles !== undefined) params.set("radius", String(radiusMiles));
    if (yearMin !== undefined) params.set("yearFrom", String(yearMin));
    if (yearMax !== undefined) params.set("yearTo", String(yearMax));
    if (priceMin !== undefined) params.set("priceFrom", String(priceMin));
    if (priceMax !== undefined) params.set("priceTo", String(priceMax));

    const qs = params.toString();
    return `https://www.carmax.com/${segments.join("/")}${qs ? `?${qs}` : ""}`;
  },
};
