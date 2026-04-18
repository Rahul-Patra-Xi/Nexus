export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function estimateDriveMinutes(km: number): number {
  const factor = 1.35;
  const avgKmh = 22;
  return Math.max(3, Math.round((km * factor / avgKmh) * 60));
}

export function formatEtaMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export type IpLocationData = {
  lat: number;
  lng: number;
  city: string;
  country: string;
};

export async function predictLocationFromIp(): Promise<IpLocationData | null> {
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("IP location fetch failed");

    const data = (await response.json()) as {
      latitude?: number;
      longitude?: number;
      city?: string;
      country_name?: string;
    };

    if (typeof data.latitude === "number" && typeof data.longitude === "number") {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || "Unknown",
        country: data.country_name || "Unknown",
      };
    }
  } catch (e) {
  }
  return null;
}
