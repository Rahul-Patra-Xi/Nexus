import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapStub } from "@/components/modules/MapStub";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { NeuActionButton } from "@/components/modules/NeuActionButton";
import { StepStrip } from "@/components/modules/StepStrip";
import { CAB_VEHICLES, DESTINATION_PRESETS, DRIVER_POOL, fareForCab, type CabVehicle, type DestinationPreset } from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { distanceKm, formatDistanceKm, formatEtaMinutes, searchAddress, type AddressSuggestion } from "@/lib/geo";
import { mockDelay } from "@/lib/mockApi";
import { appendLocalActivity } from "@/lib/localActivityLog";
import { Car, Loader2, MapPin, MapPinned, Navigation2, Search, User, X } from "lucide-react";

type Phase = "discover" | "select" | "confirm" | "track" | "complete";
type RideSub = "searching" | "assigned" | "enroute" | "done";

const stepIndex: Record<Phase, number> = {
  discover: 0,
  select: 1,
  confirm: 2,
  track: 3,
  complete: 4,
};

export const CabModule = () => {
  const { coords, label: pickupLabel } = useLocation();
  const [phase, setPhase] = useState<Phase>("discover");
  const [dest, setDest] = useState<DestinationPreset>(DESTINATION_PRESETS[0]!);
  // destination autocomplete
  const [destQuery, setDestQuery] = useState("");
  const [destSuggestions, setDestSuggestions] = useState<AddressSuggestion[]>([]);
  const [destSearching, setDestSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  const [vehicle, setVehicle] = useState<CabVehicle | null>(null);
  const [ride, setRide] = useState<RideSub>("searching");
  const [driver, setDriver] = useState<(typeof DRIVER_POOL)[0] | null>(null);
  const [busy, setBusy] = useState(false);

  const distKm = useMemo(() => {
    if (!coords) return 4.2;
    return Math.round(distanceKm(coords, dest) * 10) / 10;
  }, [coords, dest]);

  // destination autocomplete debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (destQuery.trim().length < 3) {
      setDestSuggestions([]);
      setDestSearching(false);
      return;
    }
    setDestSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddress(destQuery);
      setDestSuggestions(results);
      setDestSearching(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destQuery]);

  const pickDest = (label: string, lat: number, lng: number) => {
    setDest({ id: "custom", label, lat, lng });
    setDestQuery("");
    setDestSuggestions([]);
  };

  const vehiclesRated = useMemo(() => {
    return CAB_VEHICLES.map((v) => ({
      v,
      fare: fareForCab(v, distKm),
      arrive: v.pickupMins + Math.round(distKm * 1.8),
    }));
  }, [distKm]);

  useEffect(() => {
    if (phase !== "track") return;
    let cancelled = false;
    const run = async () => {
      setRide("searching");
      setDriver(null);
      await mockDelay(900, 400);
      if (cancelled) return;
      const d = DRIVER_POOL[Math.floor(Math.random() * DRIVER_POOL.length)]!;
      setDriver(d);
      setRide("assigned");
      await mockDelay(1400, 500);
      if (cancelled) return;
      setRide("enroute");
      await mockDelay(1800, 600);
      if (cancelled) return;
      setRide("done");
      await mockDelay(600, 200);
      if (cancelled) return;
      setPhase("complete");
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const onBook = async () => {
    if (!vehicle) return;
    setBusy(true);
    await mockDelay(300, 150);
    setBusy(false);
    setPhase("track");
  };

  const fare = vehicle ? fareForCab(vehicle, distKm) : 0;

  return (
    <ModuleLayout title="Book a cab" subtitle="Pickup, choose a ride, track like Ola / Uber — all mock, fully interactive.">
      <StepStrip active={stepIndex[phase]} />

      <AnimatePresence mode="wait">
        {phase === "discover" && (
          <motion.div key="d" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            <MapStub title="Pickup → drop" subtitle={`${pickupLabel} → ${dest.label}`} />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup</label>
              <div className="mt-1 px-4 py-3 rounded-2xl neu-pressed-sm text-sm font-medium flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" /> {pickupLabel}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Where to?</label>
              <div className="mt-1 relative">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl neu-pressed-sm">
                  <Navigation2 className="h-4 w-4 text-primary shrink-0" />
                  <input
                    ref={destInputRef}
                    value={destQuery}
                    onChange={(e) => setDestQuery(e.target.value)}
                    placeholder={dest.label}
                    className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-foreground/70"
                  />
                  {destQuery.length > 0 ? (
                    destSearching
                      ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                      : <button type="button" onClick={() => { setDestQuery(""); setDestSuggestions([]); destInputRef.current?.focus(); }}>
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {destSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 mt-1 w-full rounded-2xl bg-gradient-surface shadow-neu-raised border border-border/40 overflow-hidden"
                    >
                      {destSuggestions.map((s, i) => (
                        <motion.button
                          key={s.placeId}
                          type="button"
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => pickDest(`${s.label}, ${s.sublabel}`, s.lat, s.lng)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/60 transition-colors text-left"
                        >
                          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{s.label}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{s.sublabel}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Popular destinations (shown when not searching) */}
              {destQuery.trim().length === 0 && (
                <div className="mt-2 grid grid-cols-1 gap-1.5">
                  {DESTINATION_PRESETS.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      whileTap={{ scale: 0.99 }}
                      onClick={() => pickDest(p.label, p.lat, p.lng)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        dest.id === p.id
                          ? "bg-primary/10 border border-primary/40"
                          : "neu-pressed-sm hover:shadow-neu-raised-sm"
                      }`}
                    >
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${dest.id === p.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold truncate ${dest.id === p.id ? "text-primary" : ""}`}>{p.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-gradient-surface shadow-neu-raised-sm">
                <div className="text-muted-foreground font-semibold uppercase">Distance</div>
                <div className="font-display font-bold text-lg mt-1">{formatDistanceKm(distKm)}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-surface shadow-neu-raised-sm">
                <div className="text-muted-foreground font-semibold uppercase">ETA</div>
                <div className="font-display font-bold text-lg mt-1">{formatEtaMinutes(Math.max(8, Math.round(distKm * 3.2)))}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-surface shadow-neu-raised-sm">
                <div className="text-muted-foreground font-semibold uppercase">Surge</div>
                <div className="font-display font-bold text-lg mt-1 text-success">1.0×</div>
              </div>
            </div>
            <NeuActionButton onClick={() => setPhase("select")}>See cab options</NeuActionButton>
          </motion.div>
        )}

        {phase === "select" && (
          <motion.div key="s" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            <p className="text-sm text-muted-foreground">Fares update from your live pin → <span className="font-semibold text-foreground">{dest.label}</span></p>
            {vehiclesRated.map(({ v, fare: f, arrive }) => (
              <motion.button
                key={v.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => setVehicle(v)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  vehicle?.id === v.id ? "border-primary bg-gradient-surface shadow-neu-raised" : "border-transparent neu-pressed-sm hover:shadow-neu-raised-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary/15 flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-semibold">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{f}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold">{arrive} min total</div>
                  </div>
                </div>
              </motion.button>
            ))}
            <div className="flex gap-2 pt-2">
              <NeuActionButton variant="ghost" className="flex-1" onClick={() => setPhase("discover")}>
                Back
              </NeuActionButton>
              <NeuActionButton className="flex-1" disabled={!vehicle} onClick={() => setPhase("confirm")}>
                Continue
              </NeuActionButton>
            </div>
          </motion.div>
        )}

        {phase === "confirm" && vehicle && (
          <motion.div key="c" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-surface shadow-neu-raised space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span className="font-medium text-right max-w-[60%]">{pickupLabel}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Drop</span><span className="font-medium text-right max-w-[60%]">{dest.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cab</span><span className="font-medium">{vehicle.name}</span></div>
              <div className="flex justify-between border-t border-border/50 pt-3 mt-1"><span className="font-bold">Pay</span><span className="font-display text-2xl font-bold">₹{fare}</span></div>
            </div>
            <NeuActionButton variant="ghost" onClick={() => setPhase("select")}>Edit cab type</NeuActionButton>
            <NeuActionButton onClick={onBook} disabled={busy}>{busy ? "Confirming…" : "Book ride"}</NeuActionButton>
          </motion.div>
        )}

        {phase === "track" && vehicle && (
          <motion.div key="t" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <MapStub title="Ride in progress" subtitle={ride === "searching" ? "Finding partner…" : dest.label} />
            <div className="flex justify-center gap-2 flex-wrap text-[10px] font-bold uppercase">
              {(["searching", "assigned", "enroute", "done"] as const).map((k) => (
                <span
                  key={k}
                  className={`px-2 py-1 rounded-full ${ride === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {k === "searching" ? "Searching" : k === "assigned" ? "Assigned" : k === "enroute" ? "On the way" : "Completed"}
                </span>
              ))}
            </div>
            {driver && ride !== "searching" && (
              <div className="p-4 rounded-2xl neu-pressed-sm flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground font-display font-bold flex items-center justify-center shadow-neu-raised-sm">
                  {driver.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> {driver.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{driver.vehicle} · {driver.plate}</div>
                  <div className="text-xs font-semibold text-success mt-1">{driver.rating}★ · {driver.trips}+ trips</div>
                </div>
              </div>
            )}
            {ride === "searching" && (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <Search className="h-5 w-5 animate-pulse" /> Matching nearby drivers…
              </div>
            )}
          </motion.div>
        )}

        {phase === "complete" && vehicle && (
          <motion.div key="x" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✓</div>
              <h2 className="font-display text-xl font-semibold">Trip complete</h2>
              <p className="text-sm text-muted-foreground mt-1">Paid ₹{fare} · Thanks for riding with Nexus</p>
            </div>
            <NeuActionButton
              onClick={() => {
                appendLocalActivity({ module: "cab", title: `Cab · ${vehicle.name}`, meta: `${pickupLabel} → ${dest.label}`, status: "completed" });
                setPhase("discover");
                setVehicle(null);
                setRide("searching");
              }}
            >
              Book another
            </NeuActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleLayout>
  );
};

export default CabModule;
