import type { Parcel, PricingConfig, QuoteResult } from "./types";

export const DEFAULT_PRICING: PricingConfig = {
  mowing: {
    frequency_multipliers: { weekly: 1.0, biweekly: 1.15, monthly: 1.35 },
    visits_per_month: { weekly: 4.3, biweekly: 2.15, monthly: 1.0 },
    tiers: [
      { max_acres: 0.1, price: 40 },
      { max_acres: 0.25, price: 45 },
      { max_acres: 0.4, price: 55 },
      { max_acres: 0.5, price: 65 },
      { max_acres: 0.75, price: 85 },
      { max_acres: 1.0, price: 110 },
      { max_acres: 2.0, price: 160 },
    ],
    per_acre_over_2: 70,
    commercial_bid_threshold_acres: 2.0,
  },
  services: {
    irrigation_inspection: { label: "Sprinkler System Check", base: 89, per_zone_over_6: 15, unit: "flat" },
    fertilization: { label: "Fertilization & Weed Control (per app)", base: 85, scales_with_turf: true },
    aeration: { label: "Core Aeration", base: 120, scales_with_turf: true },
    mulch: { label: "Mulch Install (per cu yd)", base: 90, unit: "per_yard", bid: true },
    shrub_trim: { label: "Shrub & Tree Trimming", base: 12, unit: "per_shrub", bid: true },
    leaf_removal: { label: "Leaf Removal / Seasonal Cleanup", base: 200, scales_with_turf: true },
    seasonal_color: { label: "Seasonal Color (annuals)", base: 0, bid: true },
    irrigation_repair: { label: "Irrigation Repair", base: 0, bid: true },
    irrigation_install: { label: "Sprinkler System Install", base: 0, bid: true },
    sod: { label: "Sod Installation", base: 0, bid: true },
    design_install: { label: "Landscape Design & Installation", base: 0, bid: true },
    water_feature: { label: "Water Features", base: 0, bid: true },
    pools: { label: "Pools", base: 0, bid: true },
  },
  turf_estimation: { house_footprint_factor: 0.45, driveway_factor: 0.12 },
};

function mowBasePrice(acres: number, cfg: PricingConfig): number {
  for (const t of cfg.mowing.tiers) {
    if (acres <= t.max_acres) return t.price;
  }
  const top = cfg.mowing.tiers[cfg.mowing.tiers.length - 1];
  return top.price + (acres - top.max_acres) * cfg.mowing.per_acre_over_2;
}

// Real turf estimate: lot minus the building's ground-floor footprint.
// Footprint = living area / number of stories (a 2-story home covers half its living area).
// Returns null when we lack the data to compute it honestly (then the UI shows "Lot size").
export function estimateTurfSqft(parcel: Parcel, _cfg: PricingConfig): number | null {
  const lot = parcel.land_sqft || (parcel.land_acres ? parcel.land_acres * 43560 : 0);
  if (!lot || !parcel.living_area) return null;
  const stories = parcel.number_of_stories && parcel.number_of_stories > 0 ? parcel.number_of_stories : 1;
  const footprint = parcel.living_area / stories;
  return Math.max(0, Math.round(lot - footprint));
}

export function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

export function computeQuote(
  parcel: Parcel,
  cfg: PricingConfig,
  photo: { aerialUrl: string; streetUrl: string }
): QuoteResult {
  const acres = parcel.land_acres || (parcel.land_sqft ? parcel.land_sqft / 43560 : 0.2);
  const lot = parcel.land_sqft || acres * 43560;
  const turf = estimateTurfSqft(parcel, cfg);
  const turfForScale = turf ?? Math.round(lot * 0.7);
  const base = mowBasePrice(acres, cfg);
  const isCommercial =
    (parcel.property_class || "").toUpperCase().startsWith("F") ||
    acres >= cfg.mowing.commercial_bid_threshold_acres;

  const freq = (key: "weekly" | "biweekly" | "monthly") => {
    const mult = cfg.mowing.frequency_multipliers[key] ?? 1;
    const vpm = cfg.mowing.visits_per_month[key] ?? 1;
    const pricePerVisit = round5(base * mult);
    return { pricePerVisit, visitsPerMonth: vpm, estMonthly: Math.round(pricePerVisit * vpm) };
  };

  // turf scaling factor relative to a ~6,500 sqft baseline turf
  const turfFactor = Math.max(0.6, Math.min(3, turfForScale / 6500));
  const addOns = Object.entries(cfg.services).map(([key, s]) => {
    if (s.bid || s.base === 0) {
      return { key, label: s.label, price: null, bid: true };
    }
    let price = s.base;
    if (s.scales_with_turf) price = round5(s.base * turfFactor);
    return { key, label: s.label, price, bid: false };
  });

  return {
    parcel,
    acres,
    turfSqftEst: turf,
    isCommercialBid: isCommercial,
    mowing: { weekly: freq("weekly"), biweekly: freq("biweekly"), monthly: freq("monthly") },
    addOns,
    photo,
  };
}
