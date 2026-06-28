export type Parcel = {
  account_num: string;
  situs_address: string;
  situs_city: string | null;
  situs_zip: string | null;
  county: string | null;
  land_acres: number | null;
  land_sqft: number | null;
  total_value: number | null;
  appraised_value: number | null;
  latitude: number | null;
  longitude: number | null;
  property_class: string | null;
  state_use_code: string | null;
  living_area: number | null;
  year_built: number | null;
  owner_name: string | null;
  score: number | null;
};

export type FrequencyPrice = {
  pricePerVisit: number;
  visitsPerMonth: number;
  estMonthly: number;
};

export type QuoteResult = {
  parcel: Parcel;
  acres: number;
  turfSqftEst: number;
  isCommercialBid: boolean;
  mowing: {
    weekly: FrequencyPrice;
    biweekly: FrequencyPrice;
    monthly: FrequencyPrice;
  };
  addOns: { key: string; label: string; price: number | null; bid: boolean; note?: string }[];
  photo: { aerialUrl: string; streetUrl: string };
};

export type PricingConfig = {
  mowing: {
    frequency_multipliers: Record<string, number>;
    visits_per_month: Record<string, number>;
    tiers: { max_acres: number; price: number }[];
    per_acre_over_2: number;
    commercial_bid_threshold_acres: number;
  };
  services: Record<string, { label: string; base: number; per_zone_over_6?: number; unit?: string; bid?: boolean; scales_with_turf?: boolean }>;
  turf_estimation: { house_footprint_factor: number; driveway_factor: number };
};
