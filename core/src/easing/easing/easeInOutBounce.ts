import { easeOutBounce } from "./easeOutBounce";

export function easeInOutBounce(t: number): number {
  return t < 0.5
    ? 0.5 * (1.0 - easeOutBounce(1.0 - t * 2.0))
    : 0.5 * easeOutBounce(t * 2.0 - 1.0) + 0.5;
}
