import { motion } from "framer-motion";
import { TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const HeroWidget = () => {
  const { user, profile } = useAuth();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Guest";
  const city = profile?.city || "Bengaluru";
  const level = profile?.level || "Nexus Member";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-surface shadow-neu-raised-lg p-3 xs:p-4 sm:p-8"
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 xs:h-32 xs:w-32 sm:h-48 sm:w-48 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 xs:h-40 xs:w-40 sm:h-56 sm:w-56 rounded-full bg-gradient-accent opacity-15 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 xs:gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 rounded-full neu-pressed-sm">
            <Sparkles className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 text-primary" />
            <span className="text-[8px] xs:text-[9px] sm:text-[11px] font-semibold text-foreground/70">{level} · {city}</span>
          </div>
          <h1 className="mt-1.5 xs:mt-2 sm:mt-3 font-display text-xl xs:text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {greet}, <span className="text-primary">{displayName.split(" ")[0]}</span>
          </h1>
          <p className="mt-1 xs:mt-1.5 sm:mt-2 text-[10px] xs:text-xs sm:text-sm text-muted-foreground max-w-md">
            You have <span className="font-semibold text-foreground">2 active</span> services and <span className="font-semibold text-foreground">3 smart suggestions</span> waiting.
          </p>
        </div>

        <div className="flex gap-1.5 xs:gap-2 sm:gap-3">
          <div className="px-2 xs:px-3 py-1.5 xs:py-2 sm:px-4 sm:py-3 rounded-xl neu-pressed-sm min-w-[80px] xs:min-w-[90px] sm:min-w-[110px]">
            <div className="text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">This month</div>
            <div className="mt-0.5 xs:mt-0.5 sm:mt-1 flex items-baseline gap-1 xs:gap-1.5 sm:gap-1.5">
              <span className="font-display text-lg xs:text-xl sm:text-2xl font-bold text-foreground">$1,284</span>
              <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-success font-bold flex items-center gap-0.5"><TrendingUp className="h-1.5 w-1.5 xs:h-2 xs:w-2 sm:h-2.5 sm:w-2.5" />12%</span>
            </div>
          </div>
          <div className="px-2 xs:px-3 py-1.5 xs:py-2 sm:px-4 sm:py-3 rounded-xl neu-pressed-sm min-w-[80px] xs:min-w-[90px] sm:min-w-[110px] hidden sm:block">
            <div className="text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Services used</div>
            <div className="mt-0.5 xs:mt-0.5 sm:mt-1 flex items-baseline gap-1 xs:gap-1.5 sm:gap-1.5">
              <span className="font-display text-lg xs:text-xl sm:text-2xl font-bold text-foreground">8</span>
              <ArrowUpRight className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
