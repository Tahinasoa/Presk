import { Play, Pause, Square } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onStop,
  onSeek,
}: PlayerControlsProps) {
  return (
    <div className="timeline-controls">
      <div className="playback-buttons">
        <button
          type="button"
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={onStop}
          title="Stop"
        >
          <Square size={15} fill="currentColor" />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.01}
        value={currentTime}
        onChange={onSeek}
        aria-label="Timeline position"
      />

      <output>
        {currentTime.toFixed(2)} / {duration.toFixed(2)} s
      </output>
    </div>
  );
}
