# Car Marketplace Lookup

A standalone web app that builds a search query once — make, model, year range,
zip, price range, radius — and opens it directly on each marketplace's own
search results page. There's no scraping, no in-app listings, and no backend:
every adapter just constructs a URL and hands it to `window.open`.

This app is fully independent from the sneaker resale app that otherwise lives
in this repository. It has its own `package.json`, Vite/Tailwind/TypeScript
configs, and `src/` tree, and shares no imports or components with `../src`.

## Supported marketplaces

| Marketplace | Confidence | Notes |
| --- | --- | --- |
| Facebook Marketplace | High | Keyword search only — full filters need a logged-in session + geocoding, which is out of scope. |
| Craigslist | High | Requires picking a region (subdomain) first; see below. |
| AutoTrader | Medium-high | Make/model/zip path + year/price/radius query params. |
| Cars.com | Medium-high | Make/model/zip + year/price/radius query params. |
| CarMax | Medium | Make/model path + zip/year/price/radius query params. |
| Enterprise Car Sales | Low | Least-documented site; falls back to a keyword + filter query string. |

Each adapter file under `src/adapters/` has a header comment recording its
confidence level and the last query used to verify it. Marketplace URL schemes
change over time — if a link lands on a homepage instead of results, that
adapter's params are the first place to check.

### Craigslist region

Craigslist has no unified search — every metro is its own subdomain. Checking
the Craigslist checkbox reveals a region picker (20 major metros). If a
result card shows "Craigslist needs a region," pick one above; the
"Browse all Craigslist sites" link covers metros not in the list.

## Running locally

```bash
cd car-lookup-app
npm install
npm run dev
```

The dev server runs on `http://localhost:5174` (a different port from the
sneaker app, so both can run side by side).

```bash
npm run build   # production build to dist/
npm run lint    # eslint
```

## Architecture

- `src/adapters/` — one file per marketplace implementing the
  `MarketplaceAdapter` interface (`buildUrl(query): string | null`). Adding a
  new marketplace is one new file plus one line in `src/adapters/registry.ts`.
- `src/lib/validation.ts` — form validation and `FormState` → `CarSearchQuery`
  conversion (zip format, year/price range sanity, min/max swap).
- `src/lib/recent-searches.ts` + `src/hooks/useRecentSearches.ts` — last 20
  searches persisted to `localStorage`, no backend involved.
- `src/components/` — `SearchForm` (the query form), `ResultsList` /
  `MarketplaceResultCard` (one card per selected marketplace, each disabled
  with an explanation if that adapter can't build a usable URL), and
  `RecentSearches` ("Run again" repopulates the form and re-submits).

Submitting requires at least one of make/model/zip and at least one
marketplace selected; everything else degrades gracefully per-adapter rather
than blocking the whole search.
