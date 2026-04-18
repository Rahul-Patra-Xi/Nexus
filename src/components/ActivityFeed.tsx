import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Car, ShoppingBasket, Stethoscope, Wallet, Utensils, Plane, Home, Dumbbell, GraduationCap, Check, Clock, CalendarDays, Activity,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, LucideIcon> = {
  transport: Car, groceries: ShoppingBasket, health: Stethoscope, finance: Wallet,
  food: Utensils, travel: Plane, home: Home, fitness: Dumbbell, learn: GraduationCap,
};

const statusConfig = {
  completed: { icon: Check, label: "Completed", color: "hsl(var(--success))" },
  ongoing: { icon: Clock, label: "Ongoing", color: "hsl(var(--primary))" },
  scheduled: { icon: CalendarDays, label: "Scheduled", color: "hsl(var(--accent))" },
};

type A = {
  id: string;
  service: string;
  title: string;
  meta: string | null;
  amount: string | null;
  status: keyof typeof statusConfig;
  created_at: string;
};

const ago = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<A[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setItems((data ?? []) as A[]));

    const ch = supabase
      .channel("act-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "activity", filter: `user_id=eq.${user.id}` },
        (p) => {
          if (p.eventType === "INSERT") setItems((cur) => [p.new as A, ...cur].slice(0, 8));
          if (p.eventType === "DELETE") setItems((cur) => cur.filter((i) => i.id !== (p.old as A).id));
          if (p.eventType === "UPDATE") setItems((cur) => cur.map((i) => i.id === (p.new as A).id ? (p.new as A) : i));
        })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="p-2 xs:p-3 sm:p-5 rounded-2xl bg-gradient-surface shadow-neu-raised">
      <div className="flex items-baseline justify-between mb-2 xs:mb-3 sm:mb-4">
        <h3 className="font-display text-sm xs:text-base sm:text-lg font-semibold tracking-tight">Recent activity</h3>
        <span className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
        </span>
      </div>

      <div className="space-y-1.5 xs:space-y-2">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 xs:py-10 text-center">
            <div className="h-10 w-10 xs:h-12 xs:w-12 rounded-2xl bg-gradient-surface shadow-neu-raised-sm flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
            </div>
            <p className="text-[10px] xs:text-sm text-muted-foreground">No activity yet. Tap a service to get started.</p>
          </div>
        )}
        {items.map((item, i) => {
          const Icon = iconMap[item.service] ?? Activity;
          const status = statusConfig[item.status] ?? statusConfig.completed;
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 p-1.5 xs:p-2 sm:p-3 rounded-xl neu-pressed-sm hover:shadow-neu-raised-sm hover:bg-gradient-surface transition-all cursor-pointer group"
            >
              <div className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-surface shadow-neu-raised-sm flex items-center justify-center flex-shrink-0">
                <Icon className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground truncate">{item.title}</div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground truncate">{item.meta ?? ""}{item.meta ? " · " : ""}{ago(item.created_at)}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5 xs:gap-1 flex-shrink-0">
                {item.amount && <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-foreground">{item.amount}</div>}
                <div className="flex items-center gap-0.5 xs:gap-1 px-0.5 xs:px-1 sm:px-1.5 py-0.5 rounded-md" style={{ backgroundColor: status.color.replace(")", " / 0.12)") }}>
                  <StatusIcon className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" style={{ color: status.color }} />
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] font-semibold" style={{ color: status.color }}>{status.label}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
