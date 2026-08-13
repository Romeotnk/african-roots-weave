const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

export const parseCoordinate = (value: unknown): number | undefined => {
  const num = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(num) ? num : undefined;
};
