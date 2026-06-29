import { useState } from "react";
import { MARKETPLACE_ADAPTERS } from "@/adapters/registry";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/validation";
import type { CarSearchQuery, SavedSearch } from "@/types/car-search";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import SearchForm from "@/components/SearchForm";
import ResultsList from "@/components/ResultsList";
import RecentSearches from "@/components/RecentSearches";

function queryToFormState(query: CarSearchQuery): FormState {
  return {
    make: query.make ?? "",
    model: query.model ?? "",
    yearMin: query.yearMin?.toString() ?? "",
    yearMax: query.yearMax?.toString() ?? "",
    zip: query.zip ?? "",
    priceMin: query.priceMin?.toString() ?? "",
    priceMax: query.priceMax?.toString() ?? "",
    radiusMiles: query.radiusMiles?.toString() ?? "",
  };
}

interface SubmittedSearch {
  query: CarSearchQuery;
  marketplaceIds: string[];
}

const Home = () => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM_STATE);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    MARKETPLACE_ADAPTERS.map((adapter) => adapter.id),
  );
  const [craigslistRegion, setCraigslistRegion] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedSearch | null>(null);
  const { items, addSearch, clearAll } = useRecentSearches();

  const handleSubmit = (query: CarSearchQuery, marketplaceIds: string[]) => {
    setSubmitted({ query, marketplaceIds });
    addSearch({ query, marketplaceIds });
  };

  const handleRerun = (entry: SavedSearch) => {
    setForm(queryToFormState(entry.query));
    setSelectedIds(entry.marketplaceIds);
    setCraigslistRegion(entry.query.craigslistRegion ?? "");
    setSubmitted({ query: entry.query, marketplaceIds: entry.marketplaceIds });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Car Marketplace Lookup</h1>
        <p className="text-muted-foreground">
          Search once, then jump straight to matching results on each marketplace.
        </p>
      </div>

      <SearchForm
        form={form}
        onFormChange={setForm}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        craigslistRegion={craigslistRegion}
        onCraigslistRegionChange={setCraigslistRegion}
        onSubmit={handleSubmit}
      />

      {submitted && (
        <ResultsList query={submitted.query} marketplaceIds={submitted.marketplaceIds} />
      )}

      <RecentSearches items={items} onRerun={handleRerun} onClear={clearAll} />
    </div>
  );
};

export default Home;
