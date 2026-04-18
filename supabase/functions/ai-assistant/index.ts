// Streaming AI assistant (OpenAI-compatible Chat Completions API), with user context
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const baseUrl = (Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    let context = "";
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [{ data: profile }, { data: activity }, { data: notifs }] = await Promise.all([
        supabase.from("profiles").select("display_name, city, level").eq("id", user.id).maybeSingle(),
        supabase.from("activity").select("service,title,meta,amount,status,created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("notifications").select("type,title,body,created_at").eq("read", false).order("created_at", { ascending: false }).limit(5),
      ]);
      context = `\n\nUSER CONTEXT (use to personalize and chain across services):\n` +
        `Profile: ${JSON.stringify(profile ?? {})}\n` +
        `Recent activity: ${JSON.stringify(activity ?? [])}\n` +
        `Unread notifications: ${JSON.stringify(notifs ?? [])}\n`;
    }

    const systemPrompt =
      `You are Nexus AI, a concise, warm super-app assistant. The user has one identity across transport, healthcare, groceries, finance, travel, food, home services, fitness and learning. ` +
      `When useful, suggest CHAINING actions across services (e.g. doctor → pharmacy → cab). Be brief (2–4 sentences). Never mention internal data structures.` +
      context;

    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please retry shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402 || resp.status === 403) {
        return new Response(JSON.stringify({ error: "AI provider rejected the request. Check API billing and permissions." }), {
          status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI provider error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI provider error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
