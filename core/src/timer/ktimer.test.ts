import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import KTimer from './ktimer';

// ---------------------------------------------------------------------------
// Tools: manually controlled clock and requestAnimationFrame
// ---------------------------------------------------------------------------
let now = 0;
let nextId = 1;
let rafCallbacks = new Map<number, FrameRequestCallback>();

/** Advances the clock by `ms` milliseconds and then executes ONE frame. */
function advance(ms: number): void {
  now += ms;
  const pending = [...rafCallbacks.values()];
  rafCallbacks.clear();
  pending.forEach((cb) => cb(now));
}

/** Advances the clock without executing a frame (e.g. background tab). */
function tickClockOnly(ms: number): void {
  now += ms;
}

beforeEach(() => {
  now = 0;
  nextId = 1;
  rafCallbacks = new Map();

  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    rafCallbacks.delete(id);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('KTimer', () => {
  describe('initial state', () => {
    it('starts at 0 seconds', () => {
      const timer = new KTimer();
      expect(timer.progress).toBe(0);
      expect(timer.currentProgress).toBe(0);
    });

    it("does not start any loop until play() is called", () => {
      new KTimer();
      expect(rafCallbacks.size).toBe(0);
    });
  });

  describe('play()', () => {
    it('starts the requestAnimationFrame loop', () => {
      const timer = new KTimer();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });

    it('does not create multiple loops if called several times', () => {
      const timer = new KTimer();
      timer.play();
      timer.play();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });

    it('keeps scheduling a frame on each tick', () => {
      const timer = new KTimer();
      timer.play();
      advance(16);
      expect(rafCallbacks.size).toBe(1);
      advance(16);
      expect(rafCallbacks.size).toBe(1);
    });

    it('advances time in seconds', () => {
      const timer = new KTimer();
      timer.play();
      advance(500);
      expect(timer.progress).toBeCloseTo(0.5, 5);
      advance(1500);
      expect(timer.progress).toBeCloseTo(2, 5);
    });

    it('progress is an alias of currentProgress', () => {
      const timer = new KTimer();
      timer.play();
      advance(1000);
      expect(timer.progress).toBe(timer.currentProgress);
    });
  });

  describe('pause()', () => {
    it('stops the loop and cancels the scheduled frame', () => {
      const timer = new KTimer();
      timer.play();
      timer.pause();
      expect(rafCallbacks.size).toBe(0);
    });

    it("freezes time at the exact pause moment, without waiting for a frame", () => {
      const timer = new KTimer();
      timer.play();
      tickClockOnly(700); // no frame executed
      timer.pause();
      expect(timer.progress).toBeCloseTo(0.7, 5);
    });

    it('time no longer moves once paused', () => {
      const timer = new KTimer();
      timer.play();
      advance(500);
      timer.pause();
      tickClockOnly(5000);
      expect(timer.progress).toBeCloseTo(0.5, 5);
    });

    it("does nothing if the timer is not playing", () => {
      const timer = new KTimer();
      expect(() => timer.pause()).not.toThrow();
      expect(timer.progress).toBe(0);
    });

    it("play() after pause() resumes from where it stopped", () => {
      const timer = new KTimer();
      timer.play();
      advance(500);
      timer.pause();
      tickClockOnly(10_000); // long pause
      timer.play();
      advance(250);
      expect(timer.progress).toBeCloseTo(0.75, 5);
    });

    it('pause() then play() quickly does not create a duplicate loop', () => {
      const timer = new KTimer();
      timer.play();
      timer.pause();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });
  });

  describe('seek()', () => {
    it('sets the time in seconds', () => {
      const timer = new KTimer();
      timer.seek(2);
      expect(timer.progress).toBeCloseTo(2, 5);
    });

    it('clamps negative values to 0', () => {
      const timer = new KTimer();
      timer.seek(-5);
      expect(timer.progress).toBe(0);
    });

    it('continues advancing from the new position while playing', () => {
      const timer = new KTimer();
      timer.play();
      advance(1000);
      timer.seek(5);
      advance(500);
      expect(timer.progress).toBeCloseTo(5.5, 5);
    });

    it('updates tweens even while paused', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(0, 1, cb);
      timer.seek(0.5);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb.mock.calls[0][0]).toBeCloseTo(0.5, 5);
    });

    it('does not advance time while the timer is paused', () => {
      const timer = new KTimer();
      timer.seek(3);
      tickClockOnly(2000);
      expect(timer.progress).toBeCloseTo(3, 5);
    });
  });

  describe('at()', () => {
    it('is chainable', () => {
      const timer = new KTimer();
      const result = timer.at(0, 1, vi.fn()).at(1, 2, vi.fn());
      expect(result).toBe(timer);
    });

    it("does not call the callback before startTime", () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 2, cb);
      timer.play();
      advance(500);
      expect(cb).not.toHaveBeenCalled();
    });

    it('calls the callback with progress from 0 to 1', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(0, 2, cb);
      timer.play();

      advance(500); // t = 0.5s -> 0.25
      advance(500); // t = 1.0s -> 0.5
      advance(1000); // t = 2.0s -> 1

      const values = cb.mock.calls.map((c) => c[0] as number);
      expect(values[0]).toBeCloseTo(0.25, 5);
      expect(values[1]).toBeCloseTo(0.5, 5);
      expect(values[2]).toBeCloseTo(1, 5);
    });

    it('progress is always between 0 and 1', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 3, cb);
      timer.play();
      for (let i = 0; i < 300; i++) advance(16);

      for (const [p] of cb.mock.calls) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
      }
    });

    it('passes the data to the callback', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      const data = { id: 42 };
      timer.at(0, 1, cb, data);
      timer.play();
      advance(500);
      expect(cb).toHaveBeenCalledWith(expect.any(Number), data);
    });

    it('handles a zero-duration tween (startTime === endTime) with progress = 1', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 1, cb);
      timer.play();
      advance(1000);
      expect(cb).toHaveBeenCalledWith(1, undefined);
    });

    it('executes tweens in order of startTime, even when added out of order', () => {
      const timer = new KTimer();
      const order: string[] = [];
      timer.at(0, 10, () => order.push('B'));
      timer.at(0, 10, () => order.push('C'));
      timer.at(-1, 10, () => order.push('A'));
      timer.play();
      advance(100);
      expect(order).toEqual(['A', 'B', 'C']);
    });

    it('multiple simultaneous tweens each receive their own progress', () => {
      const timer = new KTimer();
      const a = vi.fn();
      const b = vi.fn();
      timer.at(0, 1, a);
      timer.at(0, 2, b);
      timer.play();
      advance(1000);
      expect(a.mock.calls.at(-1)![0]).toBeCloseTo(1, 5);
      expect(b.mock.calls.at(-1)![0]).toBeCloseTo(0.5, 5);
    });
  });

  describe('guaranteed progress = 1 (skipped tween)', () => {
    it('calls the callback with 1 if a frame jumps past endTime', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 2, cb);
      timer.play();
      advance(3000); // a single big jump: 0s -> 3s

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(1, undefined);
    });

    it('does not call the callback again once the tween is finished', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 2, cb);
      timer.play();
      advance(3000);
      advance(16);
      advance(16);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("does not call the callback after reaching exactly endTime", () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(0, 1, cb);
      timer.play();
      advance(1000); // t = 1s exactly -> progress = 1
      const callsAtEnd = cb.mock.calls.length;
      advance(16);
      expect(cb).toHaveBeenCalledTimes(callsAtEnd);
    });

    it('seek() beyond endTime triggers progress = 1', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(0, 1, cb);
      timer.seek(5);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(1, undefined);
    });

    it('going backward with seek() re-arms the tween', () => {
      const timer = new KTimer();
      const cb = vi.fn();
      timer.at(1, 2, cb);

      timer.seek(5); // tween finished
      expect(cb).toHaveBeenCalledTimes(1);

      timer.seek(0); // before startTime -> re-arm
      timer.seek(5); // again beyond endTime -> new call with 1
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenLastCalledWith(1, undefined);
    });
  });
});