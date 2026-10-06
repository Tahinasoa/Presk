export function easeInOutSine(t: number): number {
  return -0.5 * (Math.cos(Math.PI*t) - 1)
}
