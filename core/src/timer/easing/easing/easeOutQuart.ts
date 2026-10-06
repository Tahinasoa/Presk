export function easeOutQuart(t: number): number {
  return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0
}
