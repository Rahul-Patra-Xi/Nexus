import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface ServiceCardProps {
  name: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  stats: { label: string; value: string }[];
  cta: string;
  onClick?: () => void;
  index?: number;
}

export const ServiceCard = ({ name, tagline, icon: Icon, accent, stats, cta, onClick, index = 0 }: ServiceCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98, y: 0 }}
      className={cn(
        "group relative text-left w-full p-4 sm:p-5 rounded-2xl",
        "bg-gradient-surface shadow-neu-raised",
        "transition-shadow duration-200 hover:shadow-neu-raised-lg active:shadow-neu-pressed"
      )}
    >
      <div className="flex items-start justify-between mb-4 sm:mb-5">
        <div
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shadow-neu-raised-sm"
          style={{
            background: `linear-gradient(145deg, hsl(${accent} / 0.95), hsl(${accent} / 0.7))`,
          }}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-sm" strokeWidth={2.2} />
        </div>
        <div className="h-8 w-8 rounded-full neu-icon-pad opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight">{name}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{tagline}</p>

      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 p-2 rounded-xl neu-pressed-sm">
        {stats.map((s) => (
          <div key={s.label} className="px-2 py-1.5">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
        {cta}
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
};
