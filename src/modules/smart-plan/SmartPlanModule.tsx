import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ModuleLayout } from "@/components/modules/ModuleLayout";
import { SMART_BUNDLES } from "@/data/modulesDataset";
import { getLocalActivity, recentModuleTags } from "@/lib/localActivityLog";
import { Sparkles, Zap } from "lucide-react";

export const SmartPlanModule = () => {
  const recent = getLocalActivity().slice(0, 6);
  const tags = recentModuleTags(6);

  const dynamicHint =
    tags.includes("cab") && tags.includes("doctor")
      ? "You recently moved and saw a doctor — we’ll pre-fill pharmacy pickup on your next cab."
      : tags.includes("food")
        ? "Late dinner pattern detected — want groceries for tomorrow morning bundled?"
        : tags.length === 0
          ? "As you use Nexus modules, we’ll chain suggestions here with one-tap handoffs."
          : "Based on your last actions, these bundles save time and taps.";

  return (
    <ModuleLayout title="Smart Plan" subtitle="AI-style bundling across Nexus services — rules + your local activity (mock).">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/12 via-transparent to-accent/10 border border-primary/20 shadow-neu-raised mb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Sparkles className="h-4 w-4" /> Live insight
        </div>
        <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{dynamicHint}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((t) => (
              <span key={t} className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-background/80 border border-border/60">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <h2 className="font-display text-lg font-semibold mb-3 px-1">Curated bundles</h2>
      <div className="space-y-4">
        {SMART_BUNDLES.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-5 rounded-2xl bg-gradient-surface shadow-neu-float border border-border/40"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-primary/15 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg leading-tight">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.subtitle}</p>
                <p className="text-xs font-semibold text-success mt-2">{b.savings}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {b.cta.map((c) => (
                    <Link
                      key={c.label}
                      to={c.path}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-surface shadow-neu-raised-sm border border-border/50 hover:shadow-neu-raised active:shadow-neu-pressed transition-shadow"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <h2 className="font-display text-lg font-semibold mt-8 mb-3 px-1">Recent handoffs (local)</h2>
      <div className="space-y-2">
        {recent.length === 0 && <p className="text-sm text-muted-foreground px-1">Complete a ride, order, or bill to see history here.</p>}
        {recent.map((e) => (
          <div key={e.id} className="p-3 rounded-xl neu-pressed-sm text-sm">
            <div className="font-semibold">{e.title}</div>
            <div className="text-xs text-muted-foreground">{e.meta}</div>
            <div className="text-[10px] font-bold uppercase text-primary mt-1">{e.module}</div>
          </div>
        ))}
      </div>
    </ModuleLayout>
  );
};

export default SmartPlanModule;
