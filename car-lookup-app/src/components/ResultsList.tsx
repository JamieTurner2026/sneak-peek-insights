import { MARKETPLACE_ADAPTERS } from "@/adapters/registry";
import type { CarSearchQuery } from "@/types/car-search";
import MarketplaceResultCard from "@/components/MarketplaceResultCard";

interface ResultsListProps {
  query: CarSearchQuery;
  marketplaceIds: string[];
}

const ResultsList = ({ query, marketplaceIds }: ResultsListProps) => {
  const adapters = MARKETPLACE_ADAPTERS.filter((adapter) => marketplaceIds.includes(adapter.id));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adapters.map((adapter) => {
        const url = adapter.buildUrl(query);
        const disabledReason =
          adapter.requiresRegionSelect && !query.craigslistRegion
            ? "Craigslist needs a region — pick one above."
            : undefined;
        return (
          <MarketplaceResultCard
            key={adapter.id}
            adapter={adapter}
            url={url}
            disabledReason={disabledReason}
          />
        );
      })}
    </div>
  );
};

export default ResultsList;
