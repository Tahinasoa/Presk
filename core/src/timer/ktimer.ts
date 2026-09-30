// KTimer is a custom lightweight timeline and time management class.
// Supports continuous tick callbacks between start and end time with 0-1 progress and optional unknown data.
// All public times (at, seek, progress) are expressed in SECONDS.

export interface KTween {
  startTime: number; // seconds
  endTime: number;   // seconds
  callback: (progress: number, data?: unknown) => void;
  data?: unknown;
}

interface InternalTween extends KTween {
  completed: boolean; // true once the callback has been called with progress = 1
}

class KTimer {
  protected _elapsedTime = 0;   // seconds
  protected _lastTimestamp = 0; // ms (performance.now)
  protected _tweens: InternalTween[] = [];
  protected _isPlaying = false;
  protected _rafId: number | null = null;

  play(): void {
    if (this._isPlaying) return; // avoids starting several loops
    this._isPlaying = true;
    this._lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._loop);
  }

  pause(): void {
    if (!this._isPlaying) return;
    this._advance(); // accumulate time up to the exact pause moment
    this._isPlaying = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** time is in seconds, not milliseconds */
  seek(time: number): void {
    this._elapsedTime = Math.max(0, time);
    this._lastTimestamp = performance.now();
    this._render(); // updates the scene even when paused
  }

  get currentProgress(): number {
    if (this._isPlaying) this._advance();
    return this._elapsedTime;
  }

  // Alias for consistency
  get progress(): number {
    return this.currentProgress;
  }

  /**
   * Registers a function to be called repeatedly on each update between startTime and endTime (seconds),
   * receiving a progress value between 0 and 1 and an optional data object of type unknown.
   */
  at(
    startTime: number,
    endTime: number,
    callback: (progress: number, data?: unknown) => void,
    data?: unknown
  ): this {
    this._tweens.push({ startTime, endTime, callback, data, completed: false });
    this._tweens.sort((a, b) => a.startTime - b.startTime);
    return this;
  }

  /** Adds the time elapsed since the last call to _elapsedTime. */
  protected _advance(): void {
    const now = performance.now();
    this._elapsedTime += (now - this._lastTimestamp) / 1000;
    this._lastTimestamp = now;
  }

  protected _loop = (): void => {
    if (!this._isPlaying) return;
    this._advance();
    this._render();
    this._rafId = requestAnimationFrame(this._loop);
  };

  /**
   * Invokes continuous callbacks with their 0-1 progress value and data.
   */
  protected _render(): void {
    const prog = this._elapsedTime;

    for (const tween of this._tweens) {
      const { startTime, endTime } = tween;

      if (prog < startTime) {
        tween.completed = false; // e.g. after seeking backwards
      } else if (prog <= endTime) {
        const duration = endTime - startTime;
        const raw = duration === 0 ? 1 : (prog - startTime) / duration;
        tween.callback(Math.max(0, Math.min(1, raw)), tween.data);
        tween.completed = prog >= endTime;
      } else if (!tween.completed) {
        // The tween was skipped (long frame or seek): guarantee the final state
        tween.callback(1, tween.data);
        tween.completed = true;
      }
    }
  }
}

export default KTimer;