import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { DEFAULT_MAP_CENTER } from "@/data/modulesDataset";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { MapStub } from "@/components/modules/MapStub";
import { NeuActionButton } from "@/components/modules/NeuActionButton";
import { StepStripShort } from "@/components/modules/StepStrip";
import { DOCTORS, SPECIALTIES, withDistance, type DoctorRow } from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { formatDistanceKm } from "@/lib/geo";
import { mockDelay } from "@/lib/mockApi";
import { appendLocalActivity } from "@/lib/localActivityLog";
import { Calendar, Star, Stethoscope } from "lucide-react";

type Phase = "discover" | "profile" | "book" | "done";

const stepIndex: Record<Phase, number> = { discover: 0, profile: 1, book: 2, done: 3 };

const SLOT_OPTIONS = ["Today 4:30 PM", "Today 6:00 PM", "Tomorrow 10:30 AM", "Tomorrow 2:00 PM"];

export const DoctorModule = () => {
  const { coords } = useLocation();
  const origin = useMemo(
    () => coords ?? { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
    [coords],
  );
  const [phase, setPhase] = useState<Phase>("discover");
  const [spec, setSpec] = useState<string>("All");
  const [minRating, setMinRating] = useState(4.5);
  const [doc, setDoc] = useState<DoctorRow | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const ranked = withDistance(origin, DOCTORS);
    return ranked.filter((d) => (spec === "All" || d.specialty === spec) && d.rating >= minRating);
  }, [origin, spec, minRating]);

  const confirm = async () => {
    if (!doc || !slot) return;
    setBusy(true);
    await mockDelay(600, 200);
    setBusy(false);
    setPhase("done");
    appendLocalActivity({ module: "doctor", title: `${doc.name}`, meta: `${slot} · ${doc.hospital}`, status: "scheduled" });
  };

  return (
    <ModuleLayout title="Find a doctor" subtitle="Practo-like discovery, filters, profile, slot booking — mock data.">
      <StepStripShort labels={["Discover", "Profile", "Book", "Done"]} active={stepIndex[phase]} />

      <AnimatePresence mode="wait">
        {phase === "discover" && (
          <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <MapStub title="Clinics near you" subtitle="Distance uses your Nexus location pin" />
            <div className="flex gap-2 flex-wrap">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpec(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    spec === s ? "bg-gradient-primary text-primary-foreground" : "neu-pressed-sm"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Min rating · {minRating.toFixed(1)}★</label>
              <input type="range" min={4} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
            <div className="space-y-2">
              {list.map((d) => (
                <motion.button
                  key={d.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setDoc(d);
                    setPhase("profile");
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-gradient-surface shadow-neu-raised border border-border/40"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="font-display font-semibold">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialty} · {d.hospital}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="flex items-center justify-end gap-1 font-bold"><Star className="h-3 w-3 fill-warning text-warning" />{d.rating}</div>
                      <div className="text-muted-foreground">{d.reviews} reviews</div>
                      <div className="font-semibold text-foreground mt-1">₹{d.fee}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-success">{formatDistanceKm(d.distanceKm)} · {d.etaMin} min drive</div>
                </motion.button>
              ))}
              {list.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No doctors match filters — relax rating or specialty.</p>}
            </div>
          </motion.div>
        )}

        {phase === "profile" && doc && (
          <motion.div key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-surface shadow-neu-float border border-border/40">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-xl font-semibold">{doc.name}</h2>
                  <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                  <p className="text-xs mt-1">{doc.hospital}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm font-bold">
                    <Star className="h-4 w-4 fill-warning text-warning" /> {doc.rating} <span className="text-muted-foreground font-normal text-xs">({doc.reviews})</span>
                    <span className="ml-auto">₹{doc.fee} consult</span>
                  </div>
                </div>
              </div>
            </div>
            <NeuActionButton variant="ghost" onClick={() => { setDoc(null); setPhase("discover"); }}>Back to results</NeuActionButton>
            <NeuActionButton onClick={() => setPhase("book")}>Book appointment</NeuActionButton>
          </motion.div>
        )}

        {phase === "book" && doc && (
          <motion.div key="b" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a slot — calendar sync is mock only.</p>
            <div className="grid gap-2">
              {SLOT_OPTIONS.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSlot(s)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium border-2 ${
                    slot === s ? "border-primary bg-gradient-surface shadow-neu-raised-sm" : "border-transparent neu-pressed-sm"
                  }`}
                >
                  <Calendar className="h-4 w-4 text-primary" /> {s}
                </motion.button>
              ))}
            </div>
            <NeuActionButton variant="ghost" onClick={() => setPhase("profile")}>Back</NeuActionButton>
            <NeuActionButton disabled={!slot || busy} onClick={confirm}>{busy ? "Confirming…" : "Confirm booking"}</NeuActionButton>
          </motion.div>
        )}

        {phase === "done" && doc && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
            <div className="text-4xl">🩺</div>
            <h2 className="font-display text-xl font-semibold">You&apos;re booked</h2>
            <p className="text-sm text-muted-foreground">{doc.name} · {slot}</p>
            <NeuActionButton
              onClick={() => {
                setDoc(null);
                setSlot(null);
                setPhase("discover");
              }}
            >
              Find another doctor
            </NeuActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleLayout>
  );
};

export default DoctorModule;
