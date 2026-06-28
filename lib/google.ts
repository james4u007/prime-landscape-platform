// Builds Google Static Maps (aerial) + Street View Static image URLs.
// Keys are public (client-side) and restricted by HTTP referrer to the deployed domain.

const STATIC_KEY = process.env.NEXT_PUBLIC_GOOGLE_STATICMAPS_KEY || "";
const STREET_KEY = process.env.NEXT_PUBLIC_GOOGLE_STREETVIEW_KEY || "";

export function aerialUrl(opts: {
  address?: string;
  lat?: number | null;
  lng?: number | null;
  size?: string;
  zoom?: number;
  scale?: number;
}): string {
  const { address, lat, lng, size = "640x400", zoom = 19, scale = 2 } = opts;
  const center =
    lat && lng && lat !== 0 ? `${lat},${lng}` : encodeURIComponent(address || "");
  const marker =
    lat && lng && lat !== 0 ? `${lat},${lng}` : encodeURIComponent(address || "");
  return (
    `https://maps.googleapis.com/maps/api/staticmap?center=${center}` +
    `&zoom=${zoom}&size=${size}&scale=${scale}&maptype=satellite` +
    `&markers=color:0x3d8838|${marker}&key=${STATIC_KEY}`
  );
}

export function streetViewUrl(opts: {
  address?: string;
  lat?: number | null;
  lng?: number | null;
  size?: string;
}): string {
  const { address, lat, lng, size = "640x400" } = opts;
  const location =
    lat && lng && lat !== 0 ? `${lat},${lng}` : encodeURIComponent(address || "");
  return (
    `https://maps.googleapis.com/maps/api/streetview?size=${size}` +
    `&location=${location}&fov=80&pitch=10&source=outdoor&key=${STREET_KEY}`
  );
}
