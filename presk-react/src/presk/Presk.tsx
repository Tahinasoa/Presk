import { Presk as VanillaPresk } from "@presk/core";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import { useLatest } from "./useLatest";

/** Imperative API exposed via `ref`. Methods are no-ops until the instance is ready. */
export interface PreskHandle {
  play(): void;
  pause(): void;
  renderAt(time: number): void;
  readonly duration: number;
  readonly time: number;
}

export interface PreskProps {
  preskDocument: unknown;
  fps?: number;
  className?: string;
  style?: CSSProperties;
  /** Called when a document has been successfully loaded (compiled). */
  onLoad?: (info: { duration: number }) => void;
  /** Called on each rendered frame during playback. */
  onFrame?: (time: number) => void;
  /** Called for any error (creation, compilation, loading). */
  onError?: (error: unknown) => void;
}

/**
 * Headless React port of vanilla Presk:
 * mounts the root, manages the lifecycle (create/destroy), loads the document,
 * and exposes the imperative API. No UI controls here.
 */
export const Presk = forwardRef<PreskHandle, PreskProps>(function Presk(
  { preskDocument, fps = 60, className, style, onLoad, onFrame, onError },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<VanillaPresk | null>(null);
  const loadIdRef = useRef(0);

  // Must be declared BEFORE effects: their update runs first.
  const docRef = useLatest(preskDocument);
  const callbacks = useLatest({ onLoad, onFrame, onError });

  // Loads a document; only the last call "wins" (avoids race conditions).
  const load = useCallback(
    async (instance: VanillaPresk, doc: unknown) => {
      if (doc == null) return;
      const id = ++loadIdRef.current;
      try {
        await instance.load(doc);
        if (id !== loadIdRef.current || instanceRef.current !== instance) return;
        callbacks.current.onLoad?.({ duration: instance.duration });
      } catch (err) {
        if (id !== loadIdRef.current || instanceRef.current !== instance) return;
        callbacks.current.onError?.(err);
      }
    },
    [callbacks],
  );

  // Instance lifecycle: recreated only if fps changes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;

    (async () => {
      try {
        const instance = await VanillaPresk.create({ root, fps });

        if (cancelled) {
          await instance.destroy().catch(() => {});
          return;
        }

        instanceRef.current = instance;
        instance.onFrame((time) => callbacks.current.onFrame?.(time));
        await load(instance, docRef.current); // always the most recent document
      } catch (err) {
        if (!cancelled) callbacks.current.onError?.(err);
      }
    })();

    return () => {
      cancelled = true;
      loadIdRef.current++; // invalidates ongoing loads
      const instance = instanceRef.current;
      instanceRef.current = null;
      if (instance) {
        instance.pause();
        void instance.destroy().catch(() => {});
      }
    };
  }, [fps, load, callbacks, docRef]);

  // Reload when the document changes (if the instance already exists).
  useEffect(() => {
    const instance = instanceRef.current;
    if (instance) void load(instance, preskDocument);
  }, [preskDocument, load]);

  useImperativeHandle(
    ref,
    (): PreskHandle => ({
      play: () => instanceRef.current?.play(),
      pause: () => instanceRef.current?.pause(),
      renderAt: (time) => instanceRef.current?.renderAt(time),
      get duration() {
        return instanceRef.current?.duration ?? 0;
      },
      get time() {
        return instanceRef.current?.time ?? 0;
      },
    }),
    [],
  );

  return <div ref={rootRef} className={className ?? "presk_root"} style={style} />;
});
