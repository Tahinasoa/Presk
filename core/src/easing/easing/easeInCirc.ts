export function easeInCirc(t: number): number {
  return 1.0 - Math.sqrt(1.0 - t * t);
}
