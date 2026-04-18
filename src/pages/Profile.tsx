import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Save, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const nav = useNavigate();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [user, loading, nav]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setCity(profile.city ?? "");
      setLevel(profile.level ?? "");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, city })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error("Save failed", { description: error.message });
    toast.success("Profile updated");
    refreshProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    nav("/auth", { replace: true });
  };

  if (loading || !user) return null;

  const initials = (displayName || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-surface shadow-neu-raised-sm text-sm font-medium mb-6 hover:shadow-neu-raised transition-shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-surface shadow-neu-float"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary shadow-neu-raised-sm flex items-center justify-center text-primary-foreground text-xl font-bold">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">{displayName || "Your profile"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {level && (
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-primary text-primary-foreground shadow-neu-raised-sm">
                  {level}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-2xl neu-pressed-sm bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 w-full px-4 py-3 rounded-2xl neu-pressed-sm bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={save}
              disabled={busy}
              className="flex-1 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-neu-raised-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save changes"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSignOut}
              className="px-5 py-3 rounded-2xl bg-gradient-surface shadow-neu-raised-sm font-semibold flex items-center justify-center gap-2 text-foreground/80"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 p-5 rounded-2xl bg-gradient-surface shadow-neu-raised text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
            <UserIcon className="h-4 w-4" /> One identity, every service
          </div>
          Your profile auto-fills across transport, healthcare, groceries, finance, and more — synced in real time.
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
