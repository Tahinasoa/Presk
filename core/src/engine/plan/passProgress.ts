import type { RepeatMode } from "@/lang/types";

export interface PassSpec {
  duration: number;
  repeat: number | "infinite";
  mode: RepeatMode;
  ease: (x: number) => number;
}

export interface PassResult {
  p: number;
  finished: boolean;
}

export function passProgress(elapsed: number, spec: PassSpec): PassResult {
  if (spec.duration === 0) return { p: 1, finished: true };
  if (elapsed <= 0) return { p: spec.ease(0), finished: false };

  if (spec.repeat !== "infinite" && elapsed >= spec.duration * spec.repeat) {
    const p = spec.mode === "yoyo" && spec.repeat % 2 === 0 ? 0 : 1;
    return { p, finished: true };
  }

  const pass = Math.floor(elapsed / spec.duration);
  const progress = elapsed / spec.duration - pass;
  const easedProgress = spec.mode === "yoyo" && pass % 2 === 1 ? 1 - progress : progress;
  return { p: spec.ease(easedProgress), finished: false };
}
