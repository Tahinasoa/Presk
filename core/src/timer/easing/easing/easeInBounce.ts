import { easeOutBounce } from "./easeOutBounce";

export function easeInBounce(t: number): number {
  return 1.0 - easeOutBounce(1.0 - t);
}
