import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AREA_PRESETS } from "@/data/modulesDataset";
import { useLocation } from "@/contexts/LocationContext";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, Loader2 } from "lucide-react";
import { searchAddress, type AddressSuggestion } from "@/lib/geo";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export const LocationPickerDialog = ({ open, onOpenChange }: Props) => {
  const { setPreset, setManual, requestGeolocation, status } = useLocation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Debounced Nominatim search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddress(query);
      setSuggestions(results);
      setSearching(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pick = (s: AddressSuggestion) => {
    setManual(s.lat, s.lng, `${s.label}, ${s.sublabel}`);
    onOpenChange(false);
  };

  const handleGps = () => {
    requestGeolocation();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/60 bg-gradient-surface p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 shrink-0">
          <DialogTitle className="font-display text-xl">Set your location</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for area, street, landmark…"
              className="w-full pl-9 pr-9 py-3 rounded-xl neu-pressed-sm bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                {searching
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <X className="h-4 w-4" />
                }
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Autocomplete suggestions */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-3 pb-2"
              >
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s.placeId}
                    type="button"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pick(s)}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-accent/60 transition-colors text-left"
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

          {/* No results hint */}
          {query.trim().length >= 3 && !searching && suggestions.length === 0 && (
            <p className="px-5 pb-3 text-sm text-muted-foreground">No results — try a different spelling.</p>
          )}

          {/* Divider + GPS + Presets (always visible) */}
          <div className="px-4 pb-5 space-y-3">
            {suggestions.length > 0 && <div className="border-t border-border/40 pt-3" />}

            {/* GPS button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleGps}
              disabled={status === "loading"}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-neu-raised-sm text-sm disabled:opacity-60"
            >
              <Navigation className={`h-4 w-4 shrink-0 ${status === "loading" ? "animate-pulse" : ""}`} />
              {status === "loading" ? "Requesting GPS…" : "Use my current location"}
            </motion.button>

            {/* Popular areas */}
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-1">
              Popular areas
            </div>
            <div className="grid gap-1.5">
              {AREA_PRESETS.map((p) => (
                <motion.button
                  key={p.label}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setPreset(p); onOpenChange(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl neu-pressed-sm hover:shadow-neu-raised-sm transition-shadow text-left"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-[11px] text-muted-foreground">Bengaluru</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
