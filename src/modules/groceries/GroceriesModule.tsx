import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { MapStub } from "@/components/modules/MapStub";
import { NeuActionButton } from "@/components/modules/NeuActionButton";
import { StepStrip } from "@/components/modules/StepStrip";
import {
  DEFAULT_MAP_CENTER,
  GROCERY_CATALOG,
  GROCERY_STORES,
  withDistance,
  type GroceryCategory,
  type GroceryProduct,
  type GroceryStore,
} from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { formatDistanceKm } from "@/lib/geo";
import { mockDelay } from "@/lib/mockApi";
import { appendLocalActivity } from "@/lib/localActivityLog";
import { Minus, Plus } from "lucide-react";

type Phase = "discover" | "shop" | "cart" | "checkout" | "track";

const stepIndex: Record<Phase, number> = { discover: 0, shop: 1, cart: 2, checkout: 3, track: 4 };

const CATS: { id: GroceryCategory; label: string }[] = [
  { id: "fruits", label: "Fruits" },
  { id: "vegetables", label: "Vegetables" },
  { id: "dairy", label: "Dairy" },
  { id: "snacks", label: "Snacks" },
];

export const GroceriesModule = () => {
  const { coords } = useLocation();
  const origin = useMemo(
    () => coords ?? { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
    [coords],
  );
  const [phase, setPhase] = useState<Phase>("discover");
  const [store, setStore] = useState<GroceryStore | null>(null);
  const [cat, setCat] = useState<GroceryCategory>("fruits");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [addr, setAddr] = useState("12th Main, Indiranagar — Apt 402");
  const [pay, setPay] = useState("nexus_wallet");
  const [trackStep, setTrackStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const ranked = useMemo(() => withDistance(origin, GROCERY_STORES), [origin]);

  const add = (p: GroceryProduct) => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
  const sub = (p: GroceryProduct) =>
    setCart((c) => {
      const n = (c[p.id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[p.id];
      else next[p.id] = n;
      return next;
    });

  const lines = useMemo(() => {
    return GROCERY_CATALOG.filter((p) => (cart[p.id] ?? 0) > 0).map((p) => ({ p, q: cart[p.id]! }));
  }, [cart]);

  const subtotal = lines.reduce((s, { p, q }) => s + p.price * q, 0);
  const fee = subtotal > 0 ? 29 : 0;

  const startTrack = async () => {
    setBusy(true);
    await mockDelay(500, 200);
    setBusy(false);
    setPhase("track");
    setTrackStep(0);
    const id = window.setInterval(() => {
      setTrackStep((t) => {
        if (t >= 3) {
          window.clearInterval(id);
          return t;
        }
        return t + 1;
      });
    }, 2200);
  };

  const labels = ["Picking", "Packed", "On road", "Delivered"];

  return (
    <ModuleLayout title="Groceries" subtitle="Blinkit-style · nearby dark stores, cart, checkout, live tracking (mock).">
      <StepStrip active={stepIndex[phase]} />

      <AnimatePresence mode="wait">
        {phase === "discover" && (
          <motion.div key="d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            <MapStub title="Nearby dark stores" subtitle="Sorted by road distance from your pin" />
            {ranked.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setStore(s);
                  setPhase("shop");
                }}
                className="w-full text-left p-4 rounded-2xl bg-gradient-surface shadow-neu-raised border border-border/40 hover:shadow-neu-raised-lg transition-shadow"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-display font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.tagline}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-success">{s.deliveryBand}</div>
                    <div className="text-muted-foreground">{formatDistanceKm(s.distanceKm)}</div>
                    <div className="font-semibold">★ {s.rating}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {phase === "shop" && store && (
          <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-semibold">{store.name}</div>
                <div className="text-xs text-muted-foreground">{store.deliveryBand} · {formatDistanceKm(ranked.find((x) => x.id === store.id)?.distanceKm ?? 0)} away</div>
              </div>
              <NeuActionButton variant="ghost" className="!w-auto !px-3 !py-2 text-xs" onClick={() => setPhase("discover")}>
                Stores
              </NeuActionButton>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                    cat === c.id ? "bg-gradient-primary text-primary-foreground shadow-neu-raised-sm" : "neu-pressed-sm"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {GROCERY_CATALOG.filter((p) => p.category === cat).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl neu-pressed-sm">
                  <div className="text-2xl w-10 text-center">{p.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">₹{p.price} / {p.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button type="button" whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-lg neu-pressed-sm flex items-center justify-center" onClick={() => sub(p)}>
                      <Minus className="h-4 w-4" />
                    </motion.button>
                    <span className="w-6 text-center text-sm font-bold">{cart[p.id] ?? 0}</span>
                    <motion.button type="button" whileTap={{ scale: 0.9 }} className="h-8 w-8 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-neu-raised-sm" onClick={() => add(p)}>
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
            <NeuActionButton disabled={lines.length === 0} onClick={() => setPhase("cart")}>
              View cart ({lines.length} SKUs)
            </NeuActionButton>
          </motion.div>
        )}

        {phase === "cart" && (
          <motion.div key="c" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cart is empty — go back and add items.</p>
            ) : (
              lines.map(({ p, q }) => (
                <div key={p.id} className="flex justify-between text-sm p-3 rounded-xl neu-pressed-sm">
                  <span className="font-medium">{p.name} × {q}</span>
                  <span className="font-bold">₹{p.price * q}</span>
                </div>
              ))
            )}
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/50">
              <span>Delivery</span>
              <span>₹{fee}</span>
            </div>
            <div className="flex justify-between font-display text-xl font-bold">
              <span>Total</span>
              <span>₹{subtotal + fee}</span>
            </div>
            <div className="flex gap-2">
              <NeuActionButton variant="ghost" className="flex-1" onClick={() => setPhase("shop")}>
                Back
              </NeuActionButton>
              <NeuActionButton className="flex-1" disabled={lines.length === 0} onClick={() => setPhase("checkout")}>
                Checkout
              </NeuActionButton>
            </div>
          </motion.div>
        )}

        {phase === "checkout" && (
          <motion.div key="ch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Deliver to</label>
              <textarea value={addr} onChange={(e) => setAddr(e.target.value)} className="mt-1 w-full min-h-[88px] px-4 py-3 rounded-2xl neu-pressed-sm text-sm bg-transparent" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">Pay with</label>
              <select value={pay} onChange={(e) => setPay(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-2xl neu-pressed-sm text-sm bg-transparent">
                <option value="nexus_wallet">Nexus Wallet</option>
                <option value="upi">UPI (mock)</option>
                <option value="card">Card on file (mock)</option>
              </select>
            </div>
            <NeuActionButton variant="ghost" onClick={() => setPhase("cart")}>Back</NeuActionButton>
            <NeuActionButton disabled={busy || lines.length === 0} onClick={startTrack}>
              {busy ? "Placing…" : `Pay ₹${subtotal + fee}`}
            </NeuActionButton>
          </motion.div>
        )}

        {phase === "track" && store && (
          <motion.div key="tr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <MapStub title="Order on the way" subtitle={`${store.name} · ${store.deliveryBand}`} />
            <div className="flex justify-between gap-1">
              {labels.map((l, i) => (
                <div key={l} className={`flex-1 text-center text-[9px] font-bold uppercase py-2 rounded-lg ${i <= trackStep ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {l}
                </div>
              ))}
            </div>
            <NeuActionButton
              onClick={() => {
                appendLocalActivity({
                  module: "groceries",
                  title: `Grocery · ${store.name}`,
                  meta: `${lines.length} items · ₹${subtotal + fee}`,
                  status: trackStep >= 3 ? "delivered" : "in_transit",
                });
                setCart({});
                setStore(null);
                setPhase("discover");
                setTrackStep(0);
              }}
            >
              Done — back to stores
            </NeuActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleLayout>
  );
};

export default GroceriesModule;
