export function easeOutCirc(t: number): number {
  return Math.sqrt(1 - ( --t * t ));
}
