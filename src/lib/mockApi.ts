export function mockDelay(ms = 400, jitter = 250): Promise<void> {
  const t = ms + Math.random() * jitter;
  return new Promise((r) => setTimeout(r, t));
}
