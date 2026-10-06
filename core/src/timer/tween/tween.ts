import type KObject from '@/primitives/kobject';

/**
 * KTween: a time-bounded, deterministic animation step applied to a KObject.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * CONTRACT (read this before writing a tween)
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. The scene state at time `t` is fully determined by the tweens and by the
 *    initial state captured in `init`. Nothing else may modify the properties
 *    a tween animates.
 *
 * 2. A tween is the only writer of the properties it animates. User code must
 *    not touch them during playback or between frames. If an external change
 *    is unavoidable, call `reset()` afterwards so the tween writes again. ()
 *
 * 3. No overlap: two tweens must not write the same (target, property) over
 *    overlapping time intervals. Consecutive tweens on the same property
 *    (A ends exactly when B starts) are fine. 
 *
 * 4. `init` must be deterministic. It may only read the KObject state as left by
 *    the previous tweens (the timeline initialises tweens in `startTime`
 *    order, rendering each one at its end state). It must never read anything
 *    external: window size, scroll position, Date.now(), random values...
 *    `init` is where the tween `data` object gets filled.
 *
 * 5. `render` must be a pure function of (target, progress, data). It must not
 *    depend on what it did on a previous call. This is what makes seeking and
 *    reverse playback correct.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * RENDER GUARANTEES
 * ──────────────────────────────────────────────────────────────────────────
 *
 * - `render(time)` may be called every frame, with any time, in any direction.
 * - The user-supplied render function is only invoked when the clamped raw
 *   progress (before easing) has changed since the last invocation.
 * - Crossing the end of the interval always produces exactly one render at
 *   progress 1, even if a frame skips over it (e.g. 1.98 -> 2.03).
 * - Crossing the start of the interval (reverse playback or seeking back)
 *   always produces exactly one render at progress 0.
 * - Outside its interval a tween costs only a comparison.
 * - Easing is applied after clamping and its output is not clamped, so
 *   overshooting easings (easeOutBack, elastic...) work as expected.
 *
 * Ordering between tweens (forward order for forward playback, reverse order
 * for backward playback) is the responsibility of the timeline, not of the
 * tween.
 */

export type KTweenData = Record<string, unknown>;

export type KTweenInit = (target: KObject, tween: KTween) => void;

export type KTweenRender = (
	target: KObject,
	progress: number,
	data?: KTweenData,
) => void;

export interface KTweenParams {
	target: KObject;
	startTime: number;
	duration: number;
	easing?: (t: number) => number;
	init?: KTweenInit;
	render: KTweenRender;
	data?: KTweenData;
}

class KTween {
	// ── Data filled by `init` (or provided at construction) ───────────────
	data?: KTweenData;

	// ── Configuration ─────────────────────────────────────────────────────
	protected readonly _target: KObject;
	protected readonly _startTime: number;
	protected readonly _duration: number;
	protected readonly _easing: (t: number) => number;
	protected readonly _init: KTweenInit;
	protected readonly _render: KTweenRender;

	// ── Runtime state ─────────────────────────────────────────────────────
	/** Last clamped raw progress rendered (before easing). null = never rendered / reset. */
	protected _lastRaw: number | null = null;

	constructor({
		target,
		startTime,
		duration,
		easing = (t) => t,
		init = () => { },
		render,
		data,
	}: KTweenParams) {
		this._target = target;
		this._startTime = startTime;
		this._duration = Math.max(0, duration);
		this._easing = easing;
		this._init = init;
		this._render = render;
		this.data = data;
	}

	// ── Accessors ─────────────────────────────────────────────────────────
	get target(): KObject {
		return this._target;
	}

	get startTime(): number {
		return this._startTime;
	}

	get duration(): number {
		return this._duration;
	}

	get endTime(): number {
		return this._startTime + this._duration;
	}

	// ── Public API ────────────────────────────────────────────────────────

	/** Captures tween data. Called by the timeline, in startTime order, before first playback. */
	init(): void {
		this._init(this._target, this);
	}

	/** Eased progress at `time` (read-only query, does not render). */
	progress(time: number): number {
		return this._easing(this._rawProgress(time));
	}

	/**
	 * Applies the tween state for `time`.
	 * Returns true if the target was written, false if nothing changed.
	 */
	render(time: number): boolean {
		const raw = this._rawProgress(time);
		if (raw === this._lastRaw) return false;

		this._lastRaw = raw;
		this._render(this._target, this._easing(raw), this.data);
		return true;
	}

	/** Forgets the last rendered state so the next `render` always writes. Use after any external change. */
	reset(): void {
		this._lastRaw = null;
	}

	// ── Internals ─────────────────────────────────────────────────────────

	/** Raw progress clamped to [0, 1], before easing. Single source of truth for progress() and render(). */
	protected _rawProgress(time: number): number {
		if (this._duration === 0) return time >= this._startTime ? 1 : 0;
		const raw = (time - this._startTime) / this._duration;
		return Math.min(1, Math.max(0, raw));
	}
}

export default KTween;