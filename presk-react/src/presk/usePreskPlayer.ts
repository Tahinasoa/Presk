import { useCallback, useRef, useState } from "react";
import type { PreskHandle } from "./Presk";
import { formatPreskError, type PreskErrorInfo } from "./formatPreskError";

/**
 * Player state + actions. Hooks into <Presk /> via `preskRef` and `bind`.
 * Reusable for building another player with a different UI.
 */
export function usePreskPlayer() {
  const preskRef = useRef<PreskHandle>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<PreskErrorInfo | null>(null);

  // --- Handlers to pass to <Presk /> ---
  const onLoad = useCallback(({ duration }: { duration: number }) => {
    setError(null);
    setIsPlaying(false);
    setDuration(duration);
    setCurrentTime(Math.max(0, preskRef.current?.time ?? 0));
  }, []);

  const onFrame = useCallback((time: number) => {
    setCurrentTime(time);
    const d = preskRef.current?.duration ?? 0;
    if (d > 0 && time >= d) setIsPlaying(false);
  }, []);

  const onError = useCallback((err: unknown) => {
    setIsPlaying(false);
    setError(formatPreskError(err));
  }, []);

  // --- Actions ---
  const pause = useCallback(() => {
    preskRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const presk = preskRef.current;
    if (!presk) return;
    if (duration > 0 && currentTime >= duration) {
      presk.renderAt(0);
      setCurrentTime(0);
    }
    presk.play();
    setIsPlaying(true);
  }, [duration, currentTime]);

  const togglePlay = useCallback(() => (isPlaying ? pause() : play()), [isPlaying, pause, play]);

  const seek = useCallback(
    (time: number) => {
      const presk = preskRef.current;
      if (!presk) return;
      pause();
      presk.renderAt(time);
      setCurrentTime(time);
    },
    [pause],
  );

  const stop = useCallback(() => seek(0), [seek]);

  return {
    preskRef,
    bind: { onLoad, onFrame, onError },
    state: { duration, currentTime, isPlaying, error },
    actions: { play, pause, togglePlay, stop, seek },
  };
}
