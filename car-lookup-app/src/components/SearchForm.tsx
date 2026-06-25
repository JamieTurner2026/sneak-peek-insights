import { useState, type FormEvent } from "react";
import { CRAIGSLIST_REGIONS } from "@/adapters/craigslist-regions";
import {
  formStateToQuery,
  validateForm,
  type FieldErrors,
  type FormState,
} from "@/lib/validation";
import type { CarSearchQuery } from "@/types/car-search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketplaceToggleList from "@/components/MarketplaceToggleList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFormProps {
  form: FormState;
  onFormChange: (form: FormState) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  craigslistRegion: string;
  onCraigslistRegionChange: (region: string) => void;
  onSubmit: (query: CarSearchQuery, marketplaceIds: string[]) => void;
}

function withField(form: FormState, key: keyof FormState, value: string): FormState {
  return { ...form, [key]: value };
}

const SearchForm = ({
  form,
  onFormChange,
  selectedIds,
  onSelectedIdsChange,
  craigslistRegion,
  onCraigslistRegionChange,
  onSubmit,
}: SearchFormProps) => {
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm(form, selectedIds);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(formStateToQuery(form, craigslistRegion || undefined), selectedIds);
  };

  const showCraigslistRegion = selectedIds.includes("craigslist");

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                placeholder="Toyota"
                value={form.make}
                onChange={(e) => onFormChange(withField(form, "make", e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Camry"
                value={form.model}
                onChange={(e) => onFormChange(withField(form, "model", e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearMin">Year (min)</Label>
              <Input
                id="yearMin"
                inputMode="numeric"
                placeholder="2019"
                value={form.yearMin}
                onChange={(e) => onFormChange(withField(form, "yearMin", e.target.value))}
              />
              {errors.yearMin && <p className="text-xs text-destructive">{errors.yearMin}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearMax">Year (max)</Label>
              <Input
                id="yearMax"
                inputMode="numeric"
                placeholder="2021"
                value={form.yearMax}
                onChange={(e) => onFormChange(withField(form, "yearMax", e.target.value))}
              />
              {errors.yearMax && <p className="text-xs text-destructive">{errors.yearMax}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip">Zip code</Label>
              <Input
                id="zip"
                inputMode="numeric"
                placeholder="94110"
                value={form.zip}
                onChange={(e) => onFormChange(withField(form, "zip", e.target.value))}
              />
              {errors.zip && <p className="text-xs text-destructive">{errors.zip}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="radiusMiles">Radius (miles)</Label>
              <Input
                id="radiusMiles"
                inputMode="numeric"
                placeholder="50"
                value={form.radiusMiles}
                onChange={(e) => onFormChange(withField(form, "radiusMiles", e.target.value))}
              />
              {errors.radiusMiles && (
                <p className="text-xs text-destructive">{errors.radiusMiles}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priceMin">Price (min)</Label>
              <Input
                id="priceMin"
                inputMode="numeric"
                placeholder="0"
                value={form.priceMin}
                onChange={(e) => onFormChange(withField(form, "priceMin", e.target.value))}
              />
              {errors.priceMin && <p className="text-xs text-destructive">{errors.priceMin}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priceMax">Price (max)</Label>
              <Input
                id="priceMax"
                inputMode="numeric"
                placeholder="25000"
                value={form.priceMax}
                onChange={(e) => onFormChange(withField(form, "priceMax", e.target.value))}
              />
              {errors.priceMax && <p className="text-xs text-destructive">{errors.priceMax}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Marketplaces</Label>
            <MarketplaceToggleList selectedIds={selectedIds} onChange={onSelectedIdsChange} />
            {errors.marketplaces && (
              <p className="text-xs text-destructive">{errors.marketplaces}</p>
            )}
          </div>

          {showCraigslistRegion && (
            <div className="space-y-1.5">
              <Label htmlFor="craigslist-region">Craigslist region</Label>
              <Select value={craigslistRegion} onValueChange={onCraigslistRegionChange}>
                <SelectTrigger id="craigslist-region">
                  <SelectValue placeholder="Choose a region" />
                </SelectTrigger>
                <SelectContent>
                  {CRAIGSLIST_REGIONS.map((region) => (
                    <SelectItem key={region.slug} value={region.slug}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Don&apos;t see your area?{" "}
                <a
                  href="https://www.craigslist.org/about/sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Browse all Craigslist sites
                </a>
                .
              </p>
            </div>
          )}

          <Button type="submit" className="w-full sm:w-auto">
            Search marketplaces
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
