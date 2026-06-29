import type { CarSearchQuery } from "@/types/car-search";

export interface FormState {
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  zip: string;
  priceMin: string;
  priceMax: string;
  radiusMiles: string;
}

export type FieldErrors = Partial<Record<keyof FormState | "form" | "marketplaces", string>>;

const ZIP_PATTERN = /^\d{5}$/;
const MIN_YEAR = 1900;

function maxYear(): number {
  return new Date().getFullYear() + 1;
}

export function validateForm(form: FormState, selectedMarketplaceIds: string[]): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.make.trim() && !form.model.trim() && !form.zip.trim()) {
    errors.form = "Enter a make, model, or zip code to search.";
  }

  if (form.zip.trim() && !ZIP_PATTERN.test(form.zip.trim())) {
    errors.zip = "Enter a valid 5-digit zip code.";
  }

  for (const [field, value] of [
    ["yearMin", form.yearMin],
    ["yearMax", form.yearMax],
  ] as const) {
    if (value.trim() && (!/^\d{4}$/.test(value.trim()) || Number(value) < MIN_YEAR || Number(value) > maxYear())) {
      errors[field] = `Enter a year between ${MIN_YEAR} and ${maxYear()}.`;
    }
  }

  for (const [field, value] of [
    ["priceMin", form.priceMin],
    ["priceMax", form.priceMax],
  ] as const) {
    if (value.trim() && (!/^\d+$/.test(value.trim()) || Number(value) < 0)) {
      errors[field] = "Enter a non-negative price.";
    }
  }

  if (form.radiusMiles.trim() && (!/^\d+$/.test(form.radiusMiles.trim()) || Number(form.radiusMiles) <= 0)) {
    errors.radiusMiles = "Enter a positive number of miles.";
  }

  if (selectedMarketplaceIds.length === 0) {
    errors.marketplaces = "Select at least one marketplace.";
  }

  return errors;
}

export function formStateToQuery(form: FormState, craigslistRegion?: string): CarSearchQuery {
  let yearMin = form.yearMin.trim() ? Number(form.yearMin) : undefined;
  let yearMax = form.yearMax.trim() ? Number(form.yearMax) : undefined;
  if (yearMin !== undefined && yearMax === undefined) yearMax = yearMin;
  if (yearMax !== undefined && yearMin === undefined) yearMin = yearMax;
  if (yearMin !== undefined && yearMax !== undefined && yearMin > yearMax) {
    [yearMin, yearMax] = [yearMax, yearMin];
  }

  let priceMin = form.priceMin.trim() ? Number(form.priceMin) : undefined;
  let priceMax = form.priceMax.trim() ? Number(form.priceMax) : undefined;
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    [priceMin, priceMax] = [priceMax, priceMin];
  }

  return {
    make: form.make.trim() || undefined,
    model: form.model.trim() || undefined,
    zip: form.zip.trim() || undefined,
    yearMin,
    yearMax,
    priceMin,
    priceMax,
    radiusMiles: form.radiusMiles.trim() ? Number(form.radiusMiles) : undefined,
    craigslistRegion,
  };
}

export const EMPTY_FORM_STATE: FormState = {
  make: "",
  model: "",
  yearMin: "",
  yearMax: "",
  zip: "",
  priceMin: "",
  priceMax: "",
  radiusMiles: "",
};
