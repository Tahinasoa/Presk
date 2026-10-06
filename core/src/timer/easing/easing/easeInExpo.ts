export function easeInExpo(t: number): number {
  return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
}
