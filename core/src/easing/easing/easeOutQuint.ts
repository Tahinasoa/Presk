export function easeOutQuint(t: number): number {
  return --t * t * t * t * t + 1
}
