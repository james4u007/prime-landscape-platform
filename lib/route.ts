// Client-side route helpers: geocoding (Google) + nearest-neighbor sequencing.
// The Maps key is referrer-restricted, so these run in the browser (admin pages).

const KEY = process.env.NEXT_PUBLIC_GOOGLE_STATICMAPS_KEY || "";

// Prime Landscape's home base in Arlington, TX — routes start/return here.
export const DEPOT = { lat: 32.7357, lng: -97.1081 };

export type Pt = { lat: number; lng: number };

export async function geocode(address: string): Promise<Pt | null> {
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=us&key=${KEY}`
    );
    const j = await r.json();
    const loc = j?.results?.[0]?.geometry?.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  } catch {
    return null;
  }
}

// Equirectangular distance (good enough for city-scale ordering), in km.
export function distKm(a: Pt, b: Pt): number {
  const R = 6371;
  const x = ((b.lng - a.lng) * Math.PI) / 180 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  const y = ((b.lat - a.lat) * Math.PI) / 180;
  return Math.sqrt(x * x + y * y) * R;
}

// Nearest-neighbor ordering from a start point. Items must carry lat/lng.
export function orderByNearest<T extends Pt>(items: T[], start: Pt = DEPOT): T[] {
  const remaining = [...items];
  const ordered: T[] = [];
  let cur: Pt = start;
  while (remaining.length) {
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distKm(cur, remaining[i]);
      if (d < bd) { bd = d; bi = i; }
    }
    cur = remaining[bi];
    ordered.push(remaining[bi]);
    remaining.splice(bi, 1);
  }
  return ordered;
}

export function totalRouteKm(ordered: Pt[], start: Pt = DEPOT): number {
  let total = 0;
  let cur = start;
  for (const p of ordered) { total += distKm(cur, p); cur = p; }
  return total;
}

// Google Maps directions link with ordered waypoints for one-tap navigation.
export function mapsRouteUrl(stops: { lat?: number | null; lng?: number | null; address: string }[]): string {
  const pts = stops.map((s) => (s.lat && s.lng ? `${s.lat},${s.lng}` : s.address));
  if (!pts.length) return "https://www.google.com/maps";
  const origin = `${DEPOT.lat},${DEPOT.lng}`;
  const destination = pts[pts.length - 1];
  const waypoints = pts.slice(0, -1).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : "") +
    `&travelmode=driving`
  );
}
