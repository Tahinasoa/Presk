import { Presk as VanillaPresk, PreskCompileError } from "@presk/core";
import { useEffect, useRef, useState } from "react";
import { ErrorBanner } from "./ErrorBanner";
import { PlayerControls } from "./PlayerControls";

interface PreskProps {
  preskDocument: unknown;
  fps?: number;
}

export default function Presk({ preskDocument, fps }: PreskProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const preskRef = useRef<VanillaPresk | null>(null);
  const pendingDocument = useRef<unknown | null>(null);

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    let unMounted = false;

    (async () => {
      try {
        const presk = await VanillaPresk.create({
          root: rootElement,
          fps: fps || 60,
        });

        if (unMounted) {
          await presk.destroy();
          return;
        }

        preskRef.current = presk;

        presk.onFrame((time) => {
          setCurrentTime(time);
          if (presk.duration > 0 && time >= presk.duration) {
            setIsPlaying(false);
          }
        });

        const docToLoad = pendingDocument.current || preskDocument;
        if (docToLoad) {
          pendingDocument.current = null;
          await loadDocument(presk, docToLoad);
        }
      } catch (err) {
        if (!unMounted) {
          console.error("Failed to create/load Presk instance:", err);
        }
      }
    })();

    return () => {
      unMounted = true;
      const presk = preskRef.current;
      if (presk) {
        presk.pause();
        (async () => {
          try {
            await presk.destroy();
          } catch {
            // ignore
          }
        })();
      }
      preskRef.current = null;
    };
  }, [fps]);

  const loadDocument = async (presk: VanillaPresk, doc: unknown) => {
    try {
      setError(null);
      setIsPlaying(false);
      await presk.load(doc);
      setDuration(presk.duration);
      setCurrentTime(presk.time >= 0 ? presk.time : 0);
    } catch (err) {
      if (err instanceof PreskCompileError) {
        const message = err.diagnostics
          .map(({ code, message: detail }) => `${code}: ${detail}`)
          .join("\n");
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  useEffect(() => {
    const presk = preskRef.current;
    if (presk) {
      void loadDocument(presk, preskDocument);
    } else {
      pendingDocument.current = preskDocument;
    }
  }, [preskDocument]);

  const handleTogglePlay = () => {
    const presk = preskRef.current;
    if (!presk) return;
    if (isPlaying) {
      presk.pause();
      setIsPlaying(false);
    } else {
      if (duration > 0 && currentTime >= duration) {
        presk.renderAt(0);
        setCurrentTime(0);
      }
      presk.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const presk = preskRef.current;
    if (!presk) return;
    presk.pause();
    setIsPlaying(false);
    presk.renderAt(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const presk = preskRef.current;
    if (!presk) return;
    const time = Number(e.target.value);
    presk.pause();
    setIsPlaying(false);
    presk.renderAt(time);
    setCurrentTime(time);
  };

  return (
    <div className="presk-player">
      {error && <ErrorBanner error={error} />}
      <div ref={rootRef} className="presk_root" />
      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onSeek={handleSeek}
      />
    </div>
  );
}
