import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { NeuActionButton } from "@/components/modules/NeuActionButton";
import { StepStripShort } from "@/components/modules/StepStrip";
import { BILL_PROVIDERS, type BillCategoryId } from "@/data/modulesDataset";
import { mockDelay } from "@/lib/mockApi";
import { appendLocalActivity } from "@/lib/localActivityLog";
import { Bolt, Droplets, Smartphone } from "lucide-react";

type Phase = "pick" | "form" | "pay" | "success";

const icons = { electricity: Bolt, mobile: Smartphone, water: Droplets };

export const BillsModule = () => {
  const [phase, setPhase] = useState<Phase>("pick");
  const [cat, setCat] = useState<BillCategoryId | null>(null);
  const [provId, setProvId] = useState<string | null>(null);
  const [consumer, setConsumer] = useState("");
  const [busy, setBusy] = useState(false);

  const provider = cat && provId ? BILL_PROVIDERS[cat].find((p) => p.id === provId) : null;
  const amount = provider?.mockAmount ?? 0;

  const pay = async () => {
    setBusy(true);
    await mockDelay(800, 300);
    setBusy(false);
    setPhase("success");
    if (cat && provider) {
      appendLocalActivity({
        module: "bills",
        title: `${provider.name}`,
        meta: `Paid ₹${amount} · ref mock`,
        status: "paid",
      });
    }
  };

  const step = phase === "pick" ? 0 : phase === "form" ? 1 : phase === "pay" ? 2 : 3;

  return (
    <ModuleLayout title="Pay bills" subtitle="Electricity, mobile recharge, water — fetch & pay (mock).">
      <StepStripShort labels={["Category", "Details", "Pay", "Done"]} active={step} />

      <AnimatePresence mode="wait">
        {phase === "pick" && (
          <motion.div key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {(Object.keys(BILL_PROVIDERS) as BillCategoryId[]).map((key) => {
              const Icon = icons[key];
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                    <Icon className="h-4 w-4" /> {key}
                  </div>
                  <div className="grid gap-2">
                    {BILL_PROVIDERS[key].map((pr) => (
                      <motion.button
                        key={pr.id}
                        type="button"
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setCat(key);
                          setProvId(pr.id);
                          setPhase("form");
                        }}
                        className="w-full text-left p-4 rounded-2xl bg-gradient-surface shadow-neu-raised border border-border/40"
                      >
                        <div className="font-semibold">{pr.name}</div>
                        <div className="text-xs text-muted-foreground">Mock fetch · typical ₹{pr.mockAmount}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {phase === "form" && cat && provider && (
          <motion.div key="f" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl neu-pressed-sm text-sm">
              <div className="font-semibold">{provider.name}</div>
              <div className="text-xs text-muted-foreground mt-1">Bill amount (simulated)</div>
              <div className="font-display text-3xl font-bold mt-2">₹{amount}</div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">{provider.fieldLabel}</label>
              <input
                value={consumer}
                onChange={(e) => setConsumer(e.target.value)}
                placeholder={provider.placeholder}
                className="mt-1 w-full px-4 py-3 rounded-2xl neu-pressed-sm text-sm bg-transparent font-mono"
              />
            </div>
            <NeuActionButton variant="ghost" onClick={() => { setPhase("pick"); setProvId(null); setCat(null); }}>Back</NeuActionButton>
            <NeuActionButton disabled={consumer.length < 5} onClick={() => setPhase("pay")}>Continue to pay</NeuActionButton>
          </motion.div>
        )}

        {phase === "pay" && provider && (
          <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-surface shadow-neu-float text-center">
              <div className="text-xs text-muted-foreground font-semibold uppercase">Paying</div>
              <div className="font-display text-3xl font-bold mt-2">₹{amount}</div>
              <div className="text-sm text-muted-foreground mt-1">{provider.name}</div>
              <div className="text-xs font-mono mt-2 text-muted-foreground">{consumer}</div>
            </div>
            <NeuActionButton variant="ghost" onClick={() => setPhase("form")}>Edit</NeuActionButton>
            <NeuActionButton disabled={busy} onClick={pay}>{busy ? "Processing…" : "Pay now (mock)"}</NeuActionButton>
          </motion.div>
        )}

        {phase === "success" && provider && (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
            <div className="text-5xl">✓</div>
            <h2 className="font-display text-2xl font-semibold">Payment successful</h2>
            <p className="text-sm text-muted-foreground">Receipt sent to your Nexus inbox (mock).</p>
            <NeuActionButton
              onClick={() => {
                setPhase("pick");
                setCat(null);
                setProvId(null);
                setConsumer("");
              }}
            >
              Pay another bill
            </NeuActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleLayout>
  );
};

export default BillsModule;
