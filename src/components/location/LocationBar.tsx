import { MapPin, Navigation, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { LocationPickerDialog } from "./LocationPickerDialog";

export const LocationBar = ({ compact }: { compact?: boolean }) => {
  const { label, status, requestGeolocation, error } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        layout
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-surface shadow-neu-raised-sm border border-border/40 text-left hover:shadow-neu-raised transition-shadow"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-primary/15 flex items-center justify-center flex-shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</div>
          <div className="text-sm font-semibold text-foreground truncate">{label}</div>
          {error && <div className="text-xs text-destructive mt-0.5 truncate">{error}</div>}
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </motion.button>

      {!compact && (
        <div className="flex gap-2 mt-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={requestGeolocation}
            disabled={status === "loading"}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl neu-pressed-sm text-xs font-semibold disabled:opacity-60"
          >
            <Navigation className={`h-3.5 w-3.5 ${status === "loading" ? "animate-pulse" : ""}`} />
            {status === "loading" ? "Locating…" : "Use GPS"}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-xs font-semibold shadow-neu-raised-sm"
          >
            Change area
          </motion.button>
        </div>
      )}

      <LocationPickerDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
