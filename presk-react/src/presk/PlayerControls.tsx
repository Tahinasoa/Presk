import { Pause, Play, Square } from "lucide-react";
import type { ChangeEvent } from "react";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onStop: () => void;
  /** Receives the time in seconds directly (no more DOM event). */
  onSeek: (time: number) => void;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onStop,
  onSeek,
}: PlayerControlsProps) {
  const disabled = duration <= 0;
  const clamped = Math.min(Math.max(currentTime, 0), duration || 1);

  return (
    <div className="timeline-controls">
      <div className="playback-buttons">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled}
          title={isPlaying ? "Pause" : "Play"}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={disabled}
          title="Stop"
          aria-label="Stop"
        >
          <Square size={15} fill="currentColor" />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.01}
        value={clamped}
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSeek(Number(e.target.value))}
        aria-label="Timeline position"
      />

      <output>
        {clamped.toFixed(2)} / {duration.toFixed(2)} s
      </output>
    </div>
  );
}
