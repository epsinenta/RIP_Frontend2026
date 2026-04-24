import { useEffect, useRef } from "react";

export function useShortPolling(
  tick: () => void | Promise<void>,
  active: boolean,
  intervalMs: number,
): void {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timeoutId: number | undefined;
    const run = async () => {
      try {
        await Promise.resolve(tickRef.current());
      } finally {
        if (cancelled) return;
        timeoutId = window.setTimeout(() => void run(), intervalMs);
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [active, intervalMs]);
}
