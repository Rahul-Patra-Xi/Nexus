import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Zap } from "lucide-react";
import { services, providers as mockProviders } from "@/data/mockData";
import { serviceToModulePath } from "@/lib/moduleRoutes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ServiceDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const service = useMemo(() => services.find((s) => s.id === id), [id]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Service not found.</p>
          <Link to="/" className="text-primary font-semibold hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const Icon = service.icon;
  const fullModule = serviceToModulePath(service.id);
  const list = mockProviders.filter((p) => p.service === service.id);
  const display = list.length
    ? list
    : [
        { id: "g1", name: `${service.name} Pro`, service: service.id, rating: 4.8, price: "$24", eta: "10 min", badge: "Top rated" },
        { id: "g2", name: `${service.name} Express`, service: service.id, rating: 4.6, price: "$18", eta: "20 min", badge: "Cheapest" },
        { id: "g3", name: `${service.name} Premium`, service: service.id, rating: 4.9, price: "$32", eta: "8 min", badge: "Fastest" },
      ];

  const book = async (p: { name: string; price: string; eta: string }) => {
    if (!user) return nav("/auth");
    const { error } = await supabase.from("activity").insert({
      user_id: user.id,
      service: service.id,
      title: `${service.cta} — ${p.name}`,
      meta: `${p.eta} · ${service.name}`,
      amount: p.price,
      status: "ongoing",
    });
    if (error) return toast.error("Booking failed", { description: error.message });
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "success",
      title: `${service.name} booked`,
      body: `${p.name} confirmed. ETA ${p.eta}.`,
    });
    toast.success("Booked", { description: `${p.name} · ${p.price}` });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-surface shadow-neu-raised-sm text-sm font-medium mb-6 hover:shadow-neu-raised transition-shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-surface shadow-neu-float mb-6"
        >
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-2xl shadow-neu-raised-sm flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, hsl(${service.accent}), hsl(${service.accent} / 0.6))` }}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">{service.name}</h1>
              <p className="text-sm text-muted-foreground">{service.tagline}</p>
            </div>
          </div>
          {fullModule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 rounded-2xl border border-primary/30 bg-primary/5"
            >
              <p className="text-sm font-medium text-foreground">Full interactive flow</p>
              <p className="text-xs text-muted-foreground mt-1">Book, pay, and track in the dedicated Nexus module.</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => nav(fullModule)}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-neu-raised-sm"
              >
                Open live module
              </motion.button>
            </motion.div>
          )}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {service.stats.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl neu-pressed-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-display font-semibold mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <h2 className="font-display text-xl font-semibold tracking-tight mb-3 px-1">Available providers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-gradient-surface shadow-neu-raised flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-primary text-primary-foreground shadow-neu-raised-sm">
                  {p.badge}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-current text-warning" /> {p.rating}
                </div>
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{p.name}</div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.eta}</span>
                <span className="font-semibold text-foreground">{p.price}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => book(p)}
                className="mt-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-neu-raised-sm flex items-center justify-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" /> {service.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
