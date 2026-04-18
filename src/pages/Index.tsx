import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { HeroWidget } from "@/components/HeroWidget";
import { ServiceCard } from "@/components/ServiceCard";
import { QuickActionButton } from "@/components/QuickActionButton";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ComparisonEngine } from "@/components/ComparisonEngine";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { AIAssistant } from "@/components/AIAssistant";
import { SearchDialog } from "@/components/SearchDialog";
import { services, quickActions } from "@/data/mockData";
import { quickActionToPath, serviceToModulePath } from "@/lib/moduleRoutes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    const load = () => supabase
      .from("notifications").select("id", { count: "exact", head: true }).eq("read", false)
      .then(({ count }) => setUnread(count ?? 0));
    load();
    const ch = supabase
      .channel("unread-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen pb-32">
      <TopBar
        onSearchFocus={() => setSearchOpen(true)}
        onBellClick={() => setNotifOpen(true)}
        notifCount={unread}
      />

      <main className="max-w-6xl mx-auto px-2 xs:px-3 sm:px-6 mt-1 sm:mt-2 space-y-3 xs:space-y-4 sm:space-y-6">
        <HeroWidget />

        <section className="p-2 xs:p-3 sm:p-5 rounded-2xl bg-gradient-surface shadow-neu-raised">
          <div className="flex items-baseline justify-between mb-2 xs:mb-3 sm:mb-4 px-1">
            <h2 className="font-display text-xs xs:text-sm sm:text-lg font-semibold tracking-tight">Quick actions</h2>
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground">Tap to launch</span>
          </div>
          <div className="grid grid-cols-4 xs:grid-cols-4 sm:flex sm:gap-4 gap-1.5 xs:gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 xs:-mx-2 px-1 xs:px-2">
            {quickActions.map((qa, i) => (
              <QuickActionButton
                key={qa.id}
                label={qa.label}
                icon={qa.icon}
                index={i}
                onClick={() => (qa.service === "ai" ? nav(quickActionToPath("ai")) : nav(quickActionToPath(qa.service)))}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-2 xs:mb-3 sm:mb-4 px-1">
            <div>
              <h2 className="font-display text-base xs:text-lg sm:text-2xl font-semibold tracking-tight">Your services</h2>
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">One identity. Every service. Zero friction.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
            {services.map((s, i) => (
              <ServiceCard
                key={s.id}
                name={s.name}
                tagline={s.tagline}
                icon={s.icon}
                accent={s.accent}
                stats={s.stats}
                cta={s.cta}
                index={i}
                onClick={() => {
                  const mod = serviceToModulePath(s.id);
                  nav(mod ?? `/service/${s.id}`);
                }}
              />
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
          <div className="sm:col-span-3 lg:col-span-3">
            <ComparisonEngine />
          </div>
          <div className="sm:col-span-3 lg:col-span-2">
            <ActivityFeed />
          </div>
        </section>

        <motion.footer
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="pt-8 pb-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-pressed-sm text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            All systems operational · Realtime sync active
          </div>
        </motion.footer>
      </main>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <AIAssistant />
    </div>
  );
};

export default Index;
