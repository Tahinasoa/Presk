import type { Program } from "@/engine/program";

const EPSILON = 1e-9;

function roundTick(time: number): number {
  return Math.round(time / EPSILON) * EPSILON;
}

export function tickTimes(program: Program, fps: number, after: number, upTo: number): number[] {
  if (upTo < after || fps <= 0 || !Number.isFinite(fps)) return [];

  const candidates: number[] = [];
  const lastFrame = Math.floor((upTo + EPSILON) * fps);
  for (let k = 0; k <= lastFrame; k += 1) {
    candidates.push(k / fps);
  }

  for (const action of program.actions) {
    candidates.push(action.start);
    if (Number.isFinite(action.end)) candidates.push(action.end);
  }

  candidates.sort((a, b) => a - b);
  const result: number[] = [];
  for (const candidate of candidates) {
    if (!(candidate > after + EPSILON) || candidate > upTo + EPSILON) continue;
    const rounded = roundTick(candidate);
    const previous = result.at(-1);
    if (previous === undefined || rounded - previous > EPSILON) result.push(rounded);
  }
  return result;
}
