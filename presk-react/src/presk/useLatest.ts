import { useEffect, useRef, type RefObject } from "react";

/**
 * Always keeps the latest value in a ref.
 * Allows calling callbacks / reading props in effects
 * without putting them in dependencies (thus without recreating the instance).
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
