import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import KObject from "@/primitives/kobject/kobject";
import KTimer from "./ktimer";

let now = 0;
let nextId = 1;
let rafCallbacks = new Map<number, FrameRequestCallback>();

function advance(ms: number): void {
  now += ms;
  const pending = [...rafCallbacks.values()];
  rafCallbacks.clear();
  pending.forEach((cb) => cb(now));
}

function tickClockOnly(ms: number): void {
  now += ms;
}

function addXTween(
  timer: KTimer,
  id: string,
  startTime: number,
  duration: number,
  to: number,
): KObject {
  const object = new KObject({ id, x: 0, y: 0 });
  timer.addTweens(object.getTweens({ x: to }, { id, startTime, duration }));
  return object;
}

beforeEach(() => {
  now = 0;
  nextId = 1;
  rafCallbacks = new Map();

  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextId++;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    rafCallbacks.delete(id);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("KTimer", () => {
  describe("initial state", () => {
    it("starts at 0 seconds", () => {
      const timer = new KTimer();
      expect(timer.progress).toBe(0);
      expect(timer.currentProgress).toBe(0);
    });

    it("does not start any loop until play() is called", () => {
      new KTimer();
      expect(rafCallbacks.size).toBe(0);
    });
  });

  describe("play()", () => {
    it("starts the requestAnimationFrame loop", () => {
      const timer = new KTimer();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });

    it("does not create multiple loops if called several times", () => {
      const timer = new KTimer();
      timer.play();
      timer.play();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });

    it("keeps scheduling a frame on each tick", () => {
      const timer = new KTimer();
      timer.play();
      advance(16);
      expect(rafCallbacks.size).toBe(1);
      advance(16);
      expect(rafCallbacks.size).toBe(1);
    });

    it("advances time in seconds", () => {
      const timer = new KTimer();
      timer.play();
      advance(500);
      expect(timer.progress).toBeCloseTo(0.5, 5);
      advance(1500);
      expect(timer.progress).toBeCloseTo(2, 5);
    });

    it("progress is an alias of currentProgress", () => {
      const timer = new KTimer();
      timer.play();
      advance(1000);
      expect(timer.progress).toBe(timer.currentProgress);
    });
  });

  describe("pause()", () => {
    it("stops the loop and cancels the scheduled frame", () => {
      const timer = new KTimer();
      timer.play();
      timer.pause();
      expect(rafCallbacks.size).toBe(0);
    });

    it("freezes time at the exact pause moment, without waiting for a frame", () => {
      const timer = new KTimer();
      timer.play();
      tickClockOnly(700);
      timer.pause();
      expect(timer.progress).toBeCloseTo(0.7, 5);
    });

    it("time no longer moves once paused", () => {
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
      tickClockOnly(10_000);
      timer.play();
      advance(250);
      expect(timer.progress).toBeCloseTo(0.75, 5);
    });

    it("pause() then play() quickly does not create a duplicate loop", () => {
      const timer = new KTimer();
      timer.play();
      timer.pause();
      timer.play();
      expect(rafCallbacks.size).toBe(1);
    });
  });

  describe("seek()", () => {
    it("sets the time in seconds and renders its tweens", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "seek", 0, 2, 100);

      timer.seek(1);

      expect(timer.progress).toBe(1);
      expect(object.x).toBeCloseTo(50);
    });

    it("clamps negative values to 0", () => {
      const timer = new KTimer();
      timer.seek(-5);
      expect(timer.progress).toBe(0);
    });

    it("continues advancing from the new position while playing", () => {
      const timer = new KTimer();
      timer.play();
      advance(1000);
      timer.seek(5);
      advance(500);
      expect(timer.progress).toBeCloseTo(5.5, 5);
    });

    it("does not advance time while the timer is paused", () => {
      const timer = new KTimer();
      timer.seek(3);
      tickClockOnly(2000);
      expect(timer.progress).toBeCloseTo(3, 5);
    });
  });

  describe("addTweens()", () => {
    it("is chainable", () => {
      const timer = new KTimer();
      const first = new KObject({ id: "first", x: 0, y: 0 });
      const second = new KObject({ id: "second", x: 0, y: 0 });

      expect(
        timer
          .addTweens(first.getTweens({ x: 10 }, { id: "first", startTime: 0, duration: 1 }))
          .addTweens(second.getTweens({ x: 20 }, { id: "second", startTime: 1, duration: 1 })),
      ).toBe(timer);
    });

    it("does not update a target before a tween starts", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "delayed", 1, 1, 100);

      timer.seek(0.5);

      expect(object.x).toBe(0);
      timer.seek(1.5);
      expect(object.x).toBeCloseTo(50);
    });

    it("renders KObject-generated tweens to their final state when skipped", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "skipped", 1, 1, 100);

      timer.seek(3);

      expect(object.x).toBe(100);
    });

    it("handles zero-duration tweens", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "instant", 1, 0, 42);

      timer.seek(1);

      expect(object.x).toBe(42);
    });

    it("initializes sequential property tweens in start-time order", () => {
      const timer = new KTimer();
      const object = new KObject({ id: "sequence", x: 0, y: 0 });
      const firstTween = object.getTweens(
        { x: 10 },
        { id: "first", startTime: 0, duration: 1 },
      );
      const secondTween = object.getTweens(
        { x: 30 },
        { id: "second", startTime: 1, duration: 1 },
      );
      timer.addTweens(secondTween).addTweens(firstTween);

      timer.seek(2);
      expect(object.x).toBe(30);

      timer.seek(0);
      expect(object.x).toBe(0);
    });

    it("supports easing provided to KObject.getTweens()", () => {
      const timer = new KTimer();
      const object = new KObject({ id: "eased", x: 0, y: 0 });
      timer.addTweens(
        object.getTweens(
          { x: 100 },
          { id: "eased", startTime: 0, duration: 2, easing: (progress) => progress ** 2 },
        ),
      );

      timer.seek(1);

      expect(object.x).toBeCloseTo(25);
    });

    it("calls update subscribers after rendering tweens", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "update", 0, 1, 10);
      const update = vi.fn(() => expect(object.x).toBe(10));
      timer.onUpdate(update);

      timer.seek(1);

      expect(update).toHaveBeenCalledOnce();
    });
  });

  describe("playback", () => {
    it("updates KObject properties as time advances", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "playback", 0, 2, 100);

      timer.play();
      advance(500);
      expect(object.x).toBeCloseTo(25);
      advance(1500);
      expect(object.x).toBe(100);
    });

    it("seeking backwards restores earlier property values", () => {
      const timer = new KTimer();
      const object = addXTween(timer, "rewind", 0, 2, 100);

      timer.seek(2);
      expect(object.x).toBe(100);

      timer.seek(0.5);
      expect(object.x).toBeCloseTo(25);
    });
  });
});
