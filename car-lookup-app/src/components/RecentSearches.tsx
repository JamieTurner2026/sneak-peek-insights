import type { SavedSearch } from "@/types/car-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RecentSearchesProps {
  items: SavedSearch[];
  onRerun: (entry: SavedSearch) => void;
  onClear: () => void;
}

function summarize(entry: SavedSearch): string {
  const { make, model, yearMin, yearMax, zip } = entry.query;
  const parts: string[] = [];
  if (yearMin && yearMax) parts.push(yearMin === yearMax ? String(yearMin) : `${yearMin}-${yearMax}`);
  if (make) parts.push(make);
  if (model) parts.push(model);
  const label = parts.join(" ") || "Any car";
  return zip ? `${label} near ${zip}` : label;
}

const RecentSearches = ({ items, onRerun, onClear }: RecentSearchesProps) => {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent searches</h2>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        </div>
        <ul className="space-y-2">
          {items.slice(0, 10).map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-2">
              <span className="text-sm">{summarize(entry)}</span>
              <Button variant="outline" size="sm" onClick={() => onRerun(entry)}>
                Run again
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentSearches;
