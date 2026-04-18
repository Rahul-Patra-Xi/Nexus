import { motion } from "framer-motion";
import { Star, Clock, Zap, Leaf, DollarSign, type LucideIcon } from "lucide-react";
import { providers } from "@/data/mockData";

const badgeIcon: Record<string, LucideIcon> = {
  Fastest: Zap,
  Cheapest: DollarSign,
  Greenest: Leaf,
};

export const ComparisonEngine = () => {
  return (
    <div className="p-2 xs:p-3 sm:p-5 rounded-2xl bg-gradient-surface shadow-neu-raised">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-sm xs:text-base sm:text-lg font-semibold tracking-tight">Compare cab options</h3>
      </div>
      <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground mb-2 xs:mb-3 sm:mb-4">Live providers · Indiranagar → Airport</p>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3">
        {providers.map((p, i) => {
          const BadgeIcon = p.badge ? badgeIcon[p.badge] : null;
          const isFeatured = p.badge === "Fastest";
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className={`relative p-2 xs:p-3 sm:p-4 rounded-xl transition-all cursor-pointer ${
                isFeatured ? "bg-gradient-primary text-primary-foreground shadow-neu-raised-lg" : "bg-gradient-surface shadow-neu-raised-sm hover:shadow-neu-raised"
              }`}
            >
              {p.badge && (
                <div className={`absolute -top-2 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-neu-raised-sm ${
                  isFeatured ? "bg-background text-primary" : "bg-gradient-surface text-foreground/80"
                }`}>
                  {BadgeIcon && <BadgeIcon className="h-2 w-2 xs:h-2.5 xs:w-2.5" />}
                  {p.badge}
                </div>
              )}
              <div className={`text-xs xs:text-sm font-semibold ${isFeatured ? "text-primary-foreground" : "text-foreground"}`}>{p.name}</div>
              <div className={`mt-2 xs:mt-3 text-lg xs:text-xl sm:text-2xl font-display font-bold ${isFeatured ? "text-primary-foreground" : "text-foreground"}`}>
                {p.price}
              </div>
              <div className={`mt-1.5 xs:mt-2 flex items-center gap-2 xs:gap-3 text-[10px] xs:text-xs ${isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-current" />{p.rating}</span>
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />{p.eta}</span>
              </div>
              <button className={`mt-2 xs:mt-3 w-full py-1.5 xs:py-2 rounded-lg text-[10px] xs:text-xs font-semibold transition-all ${
                isFeatured
                  ? "bg-background text-primary shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed-sm"
                  : "neu-pressed-sm hover:shadow-neu-raised-sm hover:bg-gradient-surface"
              }`}>
                Select
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
