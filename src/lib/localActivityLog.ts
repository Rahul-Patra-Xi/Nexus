const KEY = "nexus_activity_v1";

export type LocalActivityEntry = {
  id: string;
  ts: number;
  module: string;
  title: string;
  meta: string;
  status?: string;
};

function read(): LocalActivityEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as LocalActivityEntry[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function write(entries: LocalActivityEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 80)));
}

export function getLocalActivity(): LocalActivityEntry[] {
  return read().sort((a, b) => b.ts - a.ts);
}

export function appendLocalActivity(entry: Omit<LocalActivityEntry, "id" | "ts"> & { id?: string }) {
  const list = read();
  const row: LocalActivityEntry = {
    id: entry.id ?? `la_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    module: entry.module,
    title: entry.title,
    meta: entry.meta,
    status: entry.status,
  };
  write([row, ...list]);
}

export function recentModuleTags(limit = 8): string[] {
  const tags = read()
    .slice(0, limit)
    .map((e) => e.module);
  return [...new Set(tags)];
}
