/** Subdomain from https://<ref>.supabase.co */
export function projectRefFromSupabaseUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    if (!host.endsWith(".supabase.co")) return null;
    const sub = host.split(".")[0];
    return sub || null;
  } catch {
    return null;
  }
}

function decodeJwtPayloadSegment(segment: string): Record<string, unknown> | null {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const withPad = padded + "=".repeat(padLen);
  try {
    const json = atob(withPad);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Reads `ref` from a Supabase anon / publishable JWT (classic or sb_publishable_… form). */
export function projectRefFromSupabaseKey(key: string): string | null {
  const parts = key.split(".");
  if (parts.length < 3) return null;
  const payload = decodeJwtPayloadSegment(parts[1]!);
  const ref = payload?.ref;
  return typeof ref === "string" ? ref : null;
}

export function warnIfSupabaseKeyUrlMismatch(url: string | undefined, key: string | undefined): void {
  if (!url?.trim() || !key?.trim()) return;
  const urlRef = projectRefFromSupabaseUrl(url);
  const keyRef = projectRefFromSupabaseKey(key);
  if (!urlRef || !keyRef) return;
  if (urlRef !== keyRef) {
    console.error(
      `[Supabase] API key is for project "${keyRef}" but VITE_SUPABASE_URL is "${urlRef}". ` +
        `Copy the anon (public) key from Dashboard → Settings → API for the same project as the URL.`,
    );
  }
}
