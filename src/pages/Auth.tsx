import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav("/", { replace: true });
  }, [user, loading, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email", {
            description: "Confirm your address to finish creating your account, then sign in here.",
          });
        } else {
          toast.success("Welcome to Nexus", { description: "You're signed in." });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Auth failed", { description: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-gradient-surface shadow-neu-float"
      >
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-primary shadow-neu-raised-sm flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Nexus</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold tracking-tight mb-1">
          {mode === "signin" ? "Welcome back" : "Create your identity"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Sign in to your unified super app." : "One profile. Every service. Zero friction."}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl neu-pressed-sm bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl neu-pressed-sm bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-2xl neu-pressed-sm bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-neu-raised-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
