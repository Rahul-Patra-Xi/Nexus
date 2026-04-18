import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AREA_PRESETS } from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { useState } from "react";
import { motion } from "framer-motion";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export const LocationPickerDialog = ({ open, onOpenChange }: Props) => {
  const { setPreset, requestGeolocation, status } = useLocation();
  const [customLabel, setCustomLabel] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/60 bg-gradient-surface max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Set your area</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            We use your position to sort nearby cabs, stores, doctors, and restaurants. GPS is optional — pick a neighbourhood anytime.
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              requestGeolocation();
              onOpenChange(false);
            }}
            disabled={status === "loading"}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-neu-raised-sm text-sm disabled:opacity-60"
          >
            {status === "loading" ? "Requesting GPS…" : "Use precise GPS location"}
          </motion.button>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Popular areas</div>
          <div className="grid gap-2">
            {AREA_PRESETS.map((p) => (
              <motion.button
                key={p.label}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setPreset(p);
                  onOpenChange(false);
                }}
                className="text-left px-4 py-3 rounded-xl neu-pressed-sm hover:shadow-neu-raised-sm transition-shadow"
              >
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-[11px] text-muted-foreground">Bengaluru · fixed pin for demos</div>
              </motion.button>
            ))}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom label (display only)</div>
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Office — EGL"
            className="w-full px-4 py-2.5 rounded-xl neu-pressed-sm bg-transparent text-sm"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const first = AREA_PRESETS[0]!;
              setPreset({ ...first, label: customLabel.trim() || first.label });
              onOpenChange(false);
            }}
            className="w-full py-2.5 rounded-xl border border-border font-semibold text-sm"
          >
            Save label on Indiranagar pin
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
