import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AREA_PRESETS, DEFAULT_MAP_CENTER, type Geo } from "@/data/modulesDataset";
import { predictLocationFromIp } from "@/lib/geo";

const LS_KEY = "nexus_location_v1";

type SavedLoc = { lat: number; lng: number; label: string; source: "geo" | "manual" };

type Ctx = {
  coords: Geo | null;
  label: string;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  requestGeolocation: () => void;
  setPreset: (preset: Geo & { label: string }) => void;
  setManual: (lat: number, lng: number, label: string) => void;
  hasFix: boolean;
};

const LocationCtx = createContext<Ctx | undefined>(undefined);

function loadSaved(): SavedLoc | null {
  try {
    const r = localStorage.getItem(LS_KEY);
    if (!r) return null;
    const j = JSON.parse(r) as SavedLoc;
    if (typeof j.lat === "number" && typeof j.lng === "number" && typeof j.label === "string") return j;
  } catch {
    /* ignore */
  }
  return null;
}

function saveLoc(s: SavedLoc) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [coords, setCoords] = useState<Geo | null>(null);
  const [label, setLabel] = useState(DEFAULT_MAP_CENTER.label);
  const [status, setStatus] = useState<Ctx["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((lat: number, lng: number, l: string, source: SavedLoc["source"]) => {
    setCoords({ lat, lng });
    setLabel(l);
    saveLoc({ lat, lng, label: l, source });
    setStatus("ready");
    setError(null);
  }, []);

  useEffect(() => {
    const s = loadSaved();
    if (s) {
      setCoords({ lat: s.lat, lng: s.lng });
      setLabel(s.label);
      setStatus("ready");
    } else {
      // Try to predict location from IP
      setStatus("loading");
      predictLocationFromIp()
        .then((ipLoc) => {
          if (ipLoc) {
            const l = `Predicted · ${ipLoc.city}`;
            persist(ipLoc.lat, ipLoc.lng, l, "geo");
          } else {
            // Fallback to default
            setCoords({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
            setLabel(DEFAULT_MAP_CENTER.label);
            setStatus("ready");
            setError(null);
          }
        })
        .catch(() => {
          // Fallback to default on error
          setCoords({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
          setLabel(DEFAULT_MAP_CENTER.label);
          setStatus("ready");
          setError(null);
        });
    }
  }, [persist]);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const l = `Near you · ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        persist(lat, lng, l, "geo");
      },
      () => {
        setStatus("error");
        setError("Could not read GPS. Pick an area below.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }, [persist]);

  const setPreset = useCallback(
    (p: Geo & { label: string }) => {
      persist(p.lat, p.lng, `${p.label} · Bengaluru`, "manual");
    },
    [persist],
  );

  const setManual = useCallback(
    (lat: number, lng: number, l: string) => {
      persist(lat, lng, l, "manual");
    },
    [persist],
  );

  const value = useMemo<Ctx>(
    () => ({
      coords,
      label,
      status,
      error,
      requestGeolocation,
      setPreset,
      setManual,
      hasFix: !!coords,
    }),
    [coords, label, status, error, requestGeolocation, setPreset, setManual],
  );

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
};

export const useLocation = () => {
  const c = useContext(LocationCtx);
  if (!c) throw new Error("useLocation must be used within LocationProvider");
  return c;
};

export { AREA_PRESETS as LOCATION_PRESETS };
