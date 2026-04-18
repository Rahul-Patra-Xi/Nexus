import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { MapStub } from "@/components/modules/MapStub";
import { NeuActionButton } from "@/components/modules/NeuActionButton";
import { StepStrip } from "@/components/modules/StepStrip";
import { DEFAULT_MAP_CENTER, RESTAURANTS, withDistance, type FoodMenuItem, type RestaurantRow } from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { formatDistanceKm } from "@/lib/geo";
import { mockDelay } from "@/lib/mockApi";
import { appendLocalActivity } from "@/lib/localActivityLog";
import { Leaf, Minus, Plus, SlidersHorizontal, Star } from "lucide-react";

type Phase = "discover" | "menu" | "cart" | "checkout" | "track";

const stepIndex: Record<Phase, number> = { discover: 0, menu: 1, cart: 2, checkout: 3, track: 4 };

export const FoodModule = () => {
  const { coords } = useLocation();
  const origin = useMemo(
    () => coords ?? { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
    [coords],
  );
  const [phase, setPhase] = useState<Phase>("discover");
  const [rest, setRest] = useState<RestaurantRow | null>(null);
  const [minRating, setMinRating] = useState(4.2);
  const [maxPft, setMaxPft] = useState(2000);
  const [cuisine, setCuisine] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [trackIdx, setTrackIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const cuisines = useMemo(() => {
    const s = new Set<string>();
    RESTAURANTS.forEach((r) => r.cuisines.forEach((c) => s.add(c)));
    return ["All", ...[...s].sort()];
  }, []);

  const ranked = useMemo(() => {
    let rows = withDistance(origin, RESTAURANTS);
    rows = rows.filter((r) => r.rating >= minRating && r.priceForTwo <= maxPft);
    if (cuisine !== "All") rows = rows.filter((r) => r.cuisines.includes(cuisine));
    return rows;
  }, [origin, minRating, maxPft, cuisine]);

  const add = (m: FoodMenuItem) => setCart((c) => ({ ...c, [m.id]: (c[m.id] ?? 0) + 1 }));
  const sub = (m: FoodMenuItem) =>
    setCart((c) => {
      const n = (c[m.id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[m.id];
      else next[m.id] = n;
      return next;
    });

  const lines = useMemo(() => {
    if (!rest) return [];
    return rest.menu.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => ({ m, q: cart[m.id]! }));
  }, [rest, cart]);

  const subtotal = lines.reduce((s, { m, q }) => s + m.price * q, 0);
  const taxes = Math.round(subtotal * 0.05);
  const del = subtotal >= 499 ? 0 : 40;

  const place = async () => {
    setBusy(true);
    await mockDelay(700, 200);
    setBusy(false);
    setPhase("track");
    setTrackIdx(0);
    const id = window.setInterval(() => {
      setTrackIdx((t) => {
        if (t >= 2) {
          window.clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 2600);
  };

  const tlabels = ["Preparing", "Out for delivery", "Delivered"];

  return (
    <ModuleLayout title="Order food" subtitle="Zomato-like · filters, menu, cart, checkout, live status (mock).">
      <StepStrip active={stepIndex[phase]} />

      <AnimatePresence mode="wait">
        {phase === "discover" && (
          <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <MapStub title="Restaurants near you" subtitle="Distance & ETA are simulated from your pin" />
            <div className="p-4 rounded-2xl neu-pressed-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Min rating · {minRating.toFixed(1)}</div>
                <input type="range" min={3.5} max={5} step={0.05} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Max price for two · ₹{maxPft}</div>
                <input type="range" min={500} max={3000} step={50} value={maxPft} onChange={(e) => setMaxPft(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {cuisines.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold ${cuisine === c ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {ranked.map((r) => (
                <motion.button
                  key={r.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setRest(r);
                    setPhase("menu");
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-gradient-surface shadow-neu-raised border border-border/40"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <div className="font-display font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
                      <div className="text-[11px] font-semibold text-primary mt-1">{r.offer}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="flex items-center justify-end gap-1 font-bold"><Star className="h-3 w-3 fill-warning text-warning" />{r.rating}</div>
                      <div>₹{r.priceForTwo} for two</div>
                      <div className="text-muted-foreground">{formatDistanceKm(r.distanceKm)}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "menu" && rest && (
          <motion.div key="m" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="font-display font-semibold text-lg">{rest.name}</div>
                <div className="text-xs text-muted-foreground">{rest.cuisines.join(" · ")}</div>
              </div>
              <NeuActionButton variant="ghost" className="!w-auto !px-3 !py-2 text-xs" onClick={() => setPhase("discover")}>
                Restaurants
              </NeuActionButton>
            </div>
            {rest.menu.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl neu-pressed-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.veg ? <Leaf className="h-3.5 w-3.5 text-success" /> : <span className="text-[10px] font-bold text-destructive">NON-VEG</span>}
                    <span className="text-sm font-semibold truncate">{item.name}</span>
                    {item.bestseller && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">Best</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">₹{item.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button type="button" whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-lg neu-pressed-sm flex items-center justify-center" onClick={() => sub(item)}>
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <span className="w-6 text-center text-sm font-bold">{cart[item.id] ?? 0}</span>
                  <motion.button type="button" whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center" onClick={() => add(item)}>
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            ))}
            <NeuActionButton disabled={lines.length === 0} onClick={() => setPhase("cart")}>
              View cart · ₹{subtotal}
            </NeuActionButton>
          </motion.div>
        )}

        {phase === "cart" && rest && (
          <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {lines.map(({ m, q }) => (
              <div key={m.id} className="flex justify-between text-sm p-3 rounded-xl neu-pressed-sm">
                <span>{m.name} × {q}</span>
                <span className="font-bold">₹{m.price * q}</span>
              </div>
            ))}
            <div className="text-xs space-y-1 border-t border-border/50 pt-3">
              <div className="flex justify-between"><span>Taxes</span><span>₹{taxes}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{del === 0 ? "FREE" : `₹${del}`}</span></div>
            </div>
            <div className="flex justify-between font-display text-xl font-bold">
              <span>Total</span>
              <span>₹{subtotal + taxes + del}</span>
            </div>
            <div className="flex gap-2">
              <NeuActionButton variant="ghost" className="flex-1" onClick={() => setPhase("menu")}>Back</NeuActionButton>
              <NeuActionButton className="flex-1" onClick={() => setPhase("checkout")}>Checkout</NeuActionButton>
            </div>
          </motion.div>
        )}

        {phase === "checkout" && rest && (
          <motion.div key="ch" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions (gate code, etc.)"
              className="w-full min-h-[80px] px-4 py-3 rounded-2xl neu-pressed-sm text-sm bg-transparent"
            />
            <NeuActionButton variant="ghost" onClick={() => setPhase("cart")}>Back</NeuActionButton>
            <NeuActionButton disabled={busy} onClick={place}>
              {busy ? "Placing…" : `Place order · ₹${subtotal + taxes + del}`}
            </NeuActionButton>
          </motion.div>
        )}

        {phase === "track" && rest && (
          <motion.div key="tr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <MapStub title="Order tracking" subtitle={rest.name} />
            <div className="flex gap-1">
              {tlabels.map((l, i) => (
                <div key={l} className={`flex-1 text-center text-[9px] font-bold uppercase py-2 rounded-lg ${i <= trackIdx ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {l}
                </div>
              ))}
            </div>
            <NeuActionButton
              onClick={() => {
                appendLocalActivity({
                  module: "food",
                  title: `Food · ${rest.name}`,
                  meta: `₹${subtotal + taxes + del} · ${tlabels[trackIdx]}`,
                  status: "delivered",
                });
                setCart({});
                setRest(null);
                setPhase("discover");
                setTrackIdx(0);
              }}
            >
              Finish — order another
            </NeuActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleLayout>
  );
};

export default FoodModule;
