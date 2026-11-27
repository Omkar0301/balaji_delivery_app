const marks = new Map<string, number>();

/**
 * Lightweight dev-only performance timer for measuring startup and screen transitions.
 */
export function markPerf(label: string): void {
  if (!__DEV__) return;
  marks.set(label, Date.now());
}

export function measurePerf(name: string, startLabel: string): number | null {
  if (!__DEV__) return null;
  const start = marks.get(startLabel);
  if (start === undefined) return null;
  const elapsedMs = Date.now() - start;
  console.log(`[Perf] ${name}: ${elapsedMs}ms`);
  return elapsedMs;
}
