export function easeOutCubic(t: number): number {
  var f = t - 1.0;
  return f * f * f + 1.0;
}
