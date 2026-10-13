// KTimer is a custom lightweight timeline and time management class.
// All public times (seek, currentProgress) and KTween times are in seconds.

import type KTween from "@/timer/tween/tween";

interface ScheduledTween {
  tween: KTween;
  offset: number;
  initialized: boolean;
}

class KTimer {
  protected _elapsedTime = 0;
  protected _lastTimestamp = 0;
  protected _tweens: ScheduledTween[] = [];
  protected _updateCallbacks = new Set<() => void>();
  protected _lastRenderedTime: number | null = null;
  protected _isPlaying = false;
  protected _rafId: number | null = null;

  get duration(): number {
    return this._tweens.reduce(
      (endTime, scheduled) => Math.max(endTime, scheduled.tween.endTime + scheduled.offset),
      0,
    );
  }

  play(): void {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this._lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._loop);
  }

  pause(): void {
    if (!this._isPlaying) return;
    this._advance();
    this._isPlaying = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Adds KObject-generated tweens, optionally shifted by a timeline offset. */
  addTweens(tweens: KTween[], offset = 0): this {
    this._tweens.push(...tweens.map((tween) => ({ tween, offset, initialized: false })));
    this._tweens.sort(
      (a, b) =>
        a.tween.startTime + a.offset - (b.tween.startTime + b.offset),
    );
    return this;
  }

  onUpdate(callback: () => void): this {
    this._updateCallbacks.add(callback);
    return this;
  }

  /** time is in seconds */
  seek(time: number): void {
    this._elapsedTime = Math.max(0, time);
    this._lastTimestamp = performance.now();
    this._render();
  }

  get currentProgress(): number {
    if (this._isPlaying) this._advance();
    return this._elapsedTime;
  }

  get progress(): number {
    return this.currentProgress;
  }

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

  protected _render(): void {
    const movingBackward =
      this._lastRenderedTime !== null && this._elapsedTime < this._lastRenderedTime;
    const tweens = movingBackward ? [...this._tweens].reverse() : this._tweens;

    for (const scheduled of tweens) {
      const { tween, offset } = scheduled;
      if (!scheduled.initialized) {
        if (this._elapsedTime < tween.startTime + offset) continue;
        tween.init();
        scheduled.initialized = true;
      }

      tween.render(this._elapsedTime - offset);
    }

    for (const callback of this._updateCallbacks) {
      callback();
    }
    this._lastRenderedTime = this._elapsedTime;
  }
}

export default KTimer;
