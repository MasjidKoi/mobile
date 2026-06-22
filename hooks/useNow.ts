import { useMemo, useSyncExternalStore } from "react";

/**
 * A single app-wide clock that ticks every 30s. All subscribers share ONE
 * interval and the SAME timestamp snapshot, so multiple prayer clocks (the Home
 * hero card + the prayer table) stay in lockstep instead of each running an
 * offset timer that could disagree on the "current" prayer for up to 30s.
 */
const INTERVAL_MS = 30_000;

let currentTs = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      currentTs = Date.now();
      listeners.forEach((l) => l());
    }, INTERVAL_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): number {
  return currentTs;
}

/** Current time as a Date, re-rendering subscribers every ~30s in lockstep. */
export function useNow(): Date {
  const ts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Memo on the (stable-between-ticks) timestamp so the Date identity only
  // changes on a real tick — keeps downstream useMemo deps stable.
  return useMemo(() => new Date(ts), [ts]);
}
