import { ErrorBanner } from "./ErrorBanner";
import { PlayerControls } from "./PlayerControls";
import { Presk } from "./Presk";
import { usePreskPlayer } from "./usePreskPlayer";

interface PreskPlayerProps {
  preskDocument: unknown;
  fps?: number;
  className?: string;
}

/** Full player: <Presk /> + errors + controls. */
export function PreskPlayer({ preskDocument, fps, className }: PreskPlayerProps) {
  const { preskRef, bind, state, actions } = usePreskPlayer();

  return (
    <div className={className ?? "presk-player"}>
      <div className="presk-view-container">
        <Presk ref={preskRef} preskDocument={preskDocument} fps={fps} {...bind} />
        {state.error && (
          <div className="presk-error-overlay">
            <ErrorBanner title={state.error.title} error={state.error.message} />
          </div>
        )}
      </div>

      <PlayerControls
        isPlaying={state.isPlaying}
        currentTime={state.currentTime}
        duration={state.duration}
        onTogglePlay={actions.togglePlay}
        onStop={actions.stop}
        onSeek={actions.seek}
      />
    </div>
  );
}
