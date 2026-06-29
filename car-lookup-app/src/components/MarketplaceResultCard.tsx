import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceAdapter } from "@/adapters/types";

interface MarketplaceResultCardProps {
  adapter: MarketplaceAdapter;
  url: string | null;
  disabledReason?: string;
}

const MarketplaceResultCard = ({ adapter, url, disabledReason }: MarketplaceResultCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{adapter.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={!url}
          onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
        >
          Open on {adapter.name}
          <ExternalLink className="h-4 w-4" />
        </Button>
        {!url && (
          <p className="mt-2 text-sm text-muted-foreground">
            {disabledReason ?? "Not enough info to search this site."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceResultCard;
