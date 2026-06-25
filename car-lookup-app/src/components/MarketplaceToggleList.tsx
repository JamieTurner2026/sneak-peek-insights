import { MARKETPLACE_ADAPTERS } from "@/adapters/registry";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MarketplaceToggleListProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const MarketplaceToggleList = ({ selectedIds, onChange }: MarketplaceToggleListProps) => {
  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((existing) => existing !== id));
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {MARKETPLACE_ADAPTERS.map((adapter) => (
        <div key={adapter.id} className="flex items-center gap-2">
          <Checkbox
            id={`marketplace-${adapter.id}`}
            checked={selectedIds.includes(adapter.id)}
            onCheckedChange={(checked) => toggle(adapter.id, checked === true)}
          />
          <Label htmlFor={`marketplace-${adapter.id}`} className="font-normal">
            {adapter.name}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceToggleList;
