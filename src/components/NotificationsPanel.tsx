import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, CheckCircle2, AlertTriangle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

type N = {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

const typeConfig = {
  info: { Icon: Info, color: "hsl(var(--accent))" },
  success: { Icon: CheckCircle2, color: "hsl(var(--success))" },
  warning: { Icon: AlertTriangle, color: "hsl(var(--warning))" },
};

const ago = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "now";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  return `${Math.floor(d / 86400)}d`;
};

export const NotificationsPanel = ({ open, onClose }: NotificationsPanelProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setItems((data ?? []) as N[]));

    const ch = supabase
      .channel("notif-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (p) => {
          if (p.eventType === "INSERT") setItems((cur) => [p.new as N, ...cur]);
          if (p.eventType === "DELETE") setItems((cur) => cur.filter((i) => i.id !== (p.old as N).id));
          if (p.eventType === "UPDATE") setItems((cur) => cur.map((i) => i.id === (p.new as N).id ? (p.new as N) : i));
        })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    if (open && user && items.some((i) => !i.read)) {
      supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {});
    }
  }, [open, user, items]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-50 p-4"
          >
            <div className="h-full flex flex-col bg-gradient-surface shadow-neu-float rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div>
                  <h2 className="font-display text-xl font-semibold">Notifications</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{items.length} updates · live</p>
                </div>
                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-full bg-gradient-surface shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed-sm transition-shadow flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-surface shadow-neu-raised-sm flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">You're all caught up.</p>
                  </div>
                )}
                {items.map((n, i) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.info;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-2xl bg-gradient-surface shadow-neu-raised-sm hover:shadow-neu-raised transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-neu-raised-sm"
                          style={{ background: `linear-gradient(145deg, ${cfg.color.replace(")", " / 0.95)")}, ${cfg.color.replace(")", " / 0.7)")})` }}
                        >
                          <cfg.Icon className="h-5 w-5 text-white" strokeWidth={2.4} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-sm font-semibold text-foreground">{n.title}</div>
                            <div className="text-[10px] font-medium text-muted-foreground flex-shrink-0">{ago(n.created_at)}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
