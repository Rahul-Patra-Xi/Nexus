import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase, SUPABASE_ANON_OR_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Plan my day", "Doctor → pharmacy → cab", "What bills are due?"];

export const AIAssistant = () => {
  const { user, session } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: user ? "Hey 👋 I'm Nexus AI. I can chain actions across your services. What's on your mind?" : "Sign in so I can give you cross-service suggestions tailored to you." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!user) { toast.error("Please sign in to chat"); return; }

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_OR_PUBLISHABLE_KEY ?? ""}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited — try again shortly.");
        else if (resp.status === 402 || resp.status === 403) {
          toast.error("AI unavailable", { description: "Check API billing and permissions for the AI provider." });
        }
        else toast.error("AI error");
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast.error("Connection error");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-primary shadow-neu-float flex items-center justify-center text-primary-foreground animate-pulse-glow"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Sparkles className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed bottom-28 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[70vh] flex flex-col bg-gradient-surface shadow-neu-float rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary shadow-neu-raised-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Nexus AI</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {streaming ? "Thinking…" : "Online · Cross-service planning"}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-gradient-primary text-primary-foreground shadow-neu-raised-sm rounded-br-md"
                          : "bg-gradient-surface text-foreground shadow-neu-raised-sm rounded-bl-md"
                      }`}
                    >
                      {m.content || "…"}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full neu-pressed-sm hover:shadow-neu-raised-sm hover:bg-gradient-surface transition-all font-medium text-foreground/80"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="p-3 border-t border-border/50 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={user ? "Ask Nexus anything…" : "Sign in to chat"}
                disabled={!user || streaming}
                className="flex-1 px-4 py-2.5 rounded-full neu-pressed-sm bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground shadow-neu-raised-sm flex items-center justify-center disabled:opacity-50"
                disabled={!input.trim() || streaming || !user}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
