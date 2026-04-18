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

export type AddressSuggestion = {
  placeId: string;
  label: string;      // short display label
  sublabel: string;   // secondary line (city, state)
  lat: number;
  lng: number;
};

/** Nominatim address autocomplete – no API key required */
export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "6");
    url.searchParams.set("countrycodes", "in"); // bias to India – remove if global
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      address?: Record<string, string>;
    }>;
    return json.map((r) => {
      const a = r.address ?? {};
      const name =
        a.amenity || a.shop || a.road || a.neighbourhood ||
        a.suburb || a.town || a.city || r.display_name.split(",")[0];
      const city = a.city || a.town || a.county || "";
      const state = a.state || "";
      const sublabel = [city, state].filter(Boolean).join(", ");
      return {
        placeId: String(r.place_id),
        label: name || r.display_name.split(",")[0],
        sublabel: sublabel || r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      };
    });
  } catch {
    return [];
  }
}

/** Reverse geocode coords → short human-readable label */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const json = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const a = json.address ?? {};
    const part1 = a.neighbourhood || a.suburb || a.road || a.amenity || "";
    const part2 = a.city || a.town || a.county || "";
    if (part1 && part2) return `${part1}, ${part2}`;
    return json.display_name?.split(",").slice(0, 2).join(",").trim() ?? `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}
