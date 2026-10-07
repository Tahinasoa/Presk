import KObject from "@/primitives/kobject";
import { describe, expect, test } from "vitest";
import { tweenNumber, tweenPoint, type PropertyTweenOptions } from "./tweenFactory";
import type KTween from "./tween";

const startTime = 5;
const duration = 10;
const endTime = startTime + duration;
const startX = -100;
const endX = 200;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const at = (fraction: number) => startTime + duration * fraction;

const createTarget = (x = 0, y = 0) => new KObject({ id: "obj", x, y });

type CustomTarget = KObject & { custom?: unknown };

/** Builds and inits a number tween on `x`. Pass `from: undefined` / `to: undefined` in overrides to omit an endpoint. */
const createNumberTween = (
	overrides: Partial<PropertyTweenOptions<number>> = {},
	target: KObject = createTarget(),
) => {
	const tween = tweenNumber({
		target,
		property: "x",
		from: startX,
		to: endX,
		startTime,
		duration,
		...overrides,
	});
	tween.init();
	return { target, tween };
};

const renderX = (tween: KTween, target: KObject, time: number) => {
	tween.render(time);
	return target.x;
};

describe("tweenNumber", () => {
	describe("interpolation", () => {
		test.each([
			["before the tween starts", startTime - 1, startX],
			["at the start time", startTime, startX],
			["a quarter of the way", at(0.25), lerp(startX, endX, 0.25)],
			["halfway", at(0.5), lerp(startX, endX, 0.5)],
			["at the end time", endTime, endX],
			["after the tween ends", endTime + 1, endX],
		])("renders %s (t=%d)", (_, time, expected) => {
			const { target, tween } = createNumberTween();
			expect(renderX(tween, target, time)).toBeCloseTo(expected, 10);
		});

		test("does not modify other properties", () => {
			const target = createTarget(0, 42);
			const { tween } = createNumberTween({}, target);

			tween.render(at(0.5));
			expect(target.y).toBe(42);
		});

		test("progress() returns eased progress without writing the target", () => {
			const { target, tween } = createNumberTween({ easing: (t) => t * t });
			const before = target.x;

			expect(tween.progress(at(0.5))).toBeCloseTo(0.25, 10);
			expect(tween.progress(startTime - 1)).toBe(0);
			expect(tween.progress(endTime + 1)).toBe(1);
			expect(target.x).toBe(before);
		});
	});

	describe("easing", () => {
		test("applies easing to progress before interpolating", () => {
			const { target, tween } = createNumberTween({ easing: (t) => t * t });
			expect(renderX(tween, target, at(0.5))).toBeCloseTo(lerp(startX, endX, 0.25), 10);
		});

		test("easing receives clamped progress, so endpoints are exact", () => {
			const received: number[] = [];
			const { target, tween } = createNumberTween({
				easing: (t) => {
					received.push(t);
					return t;
				},
			});

			tween.render(startTime - 100);
			tween.render(endTime + 100);

			expect(received).toEqual([0, 1]);
			expect(target.x).toBe(endX);
		});

		test("does not clamp the eased output (overshoot is allowed)", () => {
			const { target, tween } = createNumberTween({ easing: (t) => t * 2 });
			expect(renderX(tween, target, at(0.75))).toBeCloseTo(lerp(startX, endX, 1.5), 10);
		});
	});

	describe("omitted endpoints", () => {
		test("captures the current value at init() as `to` when `to` is omitted", () => {
			const target = createTarget(0);
			const tween = tweenNumber({ target, property: "x", from: startX, startTime, duration });

			target.x = endX; // changed after creation, before init
			tween.init();

			expect(tween.data).toEqual({ x: { from: startX, to: endX } });
			expect(renderX(tween, target, at(0.5))).toBeCloseTo(lerp(startX, endX, 0.5), 10);
		});

		test("captures the current value at init() as `from` when `from` is omitted", () => {
			const target = createTarget(0);
			const tween = tweenNumber({ target, property: "x", to: endX, startTime, duration });

			target.x = startX; // changed after creation, before init
			tween.init();

			expect(tween.data).toEqual({ x: { from: startX, to: endX } });
			expect(renderX(tween, target, at(0.5))).toBeCloseTo(lerp(startX, endX, 0.5), 10);
		});

		test("holds the captured value when both endpoints are omitted", () => {
			const target = createTarget(startX);
			const tween = tweenNumber({ target, property: "x", startTime, duration });

			target.x = endX;
			tween.init();
			expect(tween.data).toEqual({ x: { from: endX, to: endX } });

			target.x = 0; // external change after init
			tween.render(at(0.5));
			expect(target.x).toBe(endX);
		});

		test("captured values are fixed at init(): later target changes do not move the range", () => {
			const { target, tween } = createNumberTween({ from: undefined }, createTarget(startX));

			target.x = 9999;
			tween.reset();

			expect(renderX(tween, target, startTime)).toBe(startX);
		});

		test("a following tween picks up where the previous one ended", () => {
			const target = createTarget(0);
			const a = tweenNumber({ target, property: "x", from: 0, to: 100, startTime: 0, duration: 10 });
			const b = tweenNumber({ target, property: "x", to: 300, startTime: 10, duration: 10 });

			// Timeline contract: init in startTime order, rendering each at its end state.
			a.init();
			a.render(10);
			b.init();

			expect(b.data).toEqual({ x: { from: 100, to: 300 } });
			b.render(15);
			expect(target.x).toBeCloseTo(200, 10);
		});
	});

	describe("render caching and seeking", () => {
		test("returns true on the first render and false when raw progress is unchanged", () => {
			const { tween } = createNumberTween();

			expect(tween.render(at(0.5))).toBe(true);
			expect(tween.render(at(0.5))).toBe(false);
			expect(tween.render(at(0.6))).toBe(true);
		});

		test("does not rewrite the target when raw progress is unchanged", () => {
			const { target, tween } = createNumberTween();

			tween.render(at(0.5));
			target.x = 12345; // external change
			expect(tween.render(at(0.5))).toBe(false);
			expect(target.x).toBe(12345);
		});

		test("reset() forces the next render to write again", () => {
			const { target, tween } = createNumberTween();

			tween.render(at(0.5));
			target.x = 12345;
			tween.reset();

			expect(tween.render(at(0.5))).toBe(true);
			expect(target.x).toBeCloseTo(lerp(startX, endX, 0.5), 10);
		});

		test("a failed render does not poison the cache", () => {
			const target = createTarget() as CustomTarget;
			target.custom = startX;
			const tween = tweenNumber({ target, property: "custom", to: endX, startTime, duration });
			tween.init();

			delete target.custom;
			expect(() => tween.render(at(0.5))).toThrow();

			target.custom = startX; // restored
			expect(tween.render(at(0.5))).toBe(true);
			expect(target.custom).toBeCloseTo(lerp(startX, endX, 0.5), 10);
		});

		test("a throwing easing does not poison the cache", () => {
			let shouldThrow = true;
			const { target, tween } = createNumberTween({
				easing: (t) => {
					if (shouldThrow) throw new Error("boom");
					return t;
				},
			});

			expect(() => tween.render(at(0.5))).toThrow("boom");

			shouldThrow = false;
			expect(tween.render(at(0.5))).toBe(true);
			expect(target.x).toBeCloseTo(lerp(startX, endX, 0.5), 10);
		});

		test.each([
			["render", (tween: KTween) => tween.render(Number.NaN)],
			["progress", (tween: KTween) => tween.progress(Number.NaN)],
		])("%s() rejects a NaN time and leaves the target untouched", (_, call) => {
			const { target, tween } = createNumberTween();
			tween.render(at(0.5));
			const before = target.x;

			expect(() => call(tween)).toThrow("time must not be NaN");
			expect(target.x).toBe(before);
			expect(tween.render(at(0.5))).toBe(false); // cache intact
		});

		test("times outside the interval share clamped progress and skip redundant writes", () => {
			const { tween } = createNumberTween();

			expect(tween.render(startTime - 10)).toBe(true);
			expect(tween.render(startTime - 1)).toBe(false);
			expect(tween.render(startTime)).toBe(false);

			expect(tween.render(endTime)).toBe(true);
			expect(tween.render(endTime + 50)).toBe(false);
		});

		test("a frame that skips over the end still lands exactly on `to`", () => {
			const { target, tween } = createNumberTween();

			tween.render(endTime - 0.01);
			expect(tween.render(endTime + 5)).toBe(true);
			expect(target.x).toBe(endX);
		});

		test("seeking back before the start lands exactly on `from`", () => {
			const { target, tween } = createNumberTween();

			tween.render(endTime);
			expect(tween.render(startTime - 100)).toBe(true);
			expect(target.x).toBe(startX);
		});

		test("seeks to an arbitrary time after rendering the end value", () => {
			const { target, tween } = createNumberTween();

			tween.render(endTime);
			expect(renderX(tween, target, at(0.25))).toBeCloseTo(lerp(startX, endX, 0.25), 10);
		});

		test("is deterministic: the same time gives the same value regardless of history", () => {
			const times = [at(0.3), at(0.9), endTime + 3, at(0.1), startTime - 2, at(0.6)];

			const reference = (time: number) => {
				const { target, tween } = createNumberTween();
				return renderX(tween, target, time);
			};

			const { target, tween } = createNumberTween();
			for (const time of times) {
				expect(renderX(tween, target, time)).toBeCloseTo(reference(time), 10);
			}
		});

		test("forward then reverse playback visits identical values", () => {
			const { target, tween } = createNumberTween();
			const steps = Array.from({ length: 21 }, (_, i) => startTime - 1 + i);

			const forward = steps.map((time) => renderX(tween, target, time));
			const backward = [...steps].reverse().map((time) => renderX(tween, target, time)).reverse();

			expect(backward).toEqual(forward);
		});
	});

	describe("zero duration", () => {
		test("holds `from` before the start time and `to` at or after it", () => {
			const { target, tween } = createNumberTween({ duration: 0 });

			expect(renderX(tween, target, startTime - 1)).toBe(startX);
			expect(renderX(tween, target, startTime)).toBe(endX);
			expect(renderX(tween, target, startTime + 1)).toBe(endX);
			expect(renderX(tween, target, startTime - 1)).toBe(startX);
		});
	});

	describe("validation at creation", () => {
		test("throws when the property does not exist", () => {
			expect(() =>
				tweenNumber({ target: createTarget(), property: "nope", to: 1 }),
			).toThrow("property does not exist on target");
		});

		test("throws when the property is a read-only data property", () => {
			const target = createTarget() as CustomTarget;
			Object.defineProperty(target, "custom", { value: 1, writable: false, enumerable: true });

			expect(() =>
				tweenNumber({ target, property: "custom", to: 2 }),
			).toThrow("property is not writable");
		});

		test("throws when the property is a getter without a setter", () => {
			const target = createTarget() as CustomTarget;
			Object.defineProperty(target, "custom", { get: () => 1, enumerable: true });

			expect(() =>
				tweenNumber({ target, property: "custom", to: 2 }),
			).toThrow("property is not writable");
		});

		test("accepts a writable property defined on the prototype chain", () => {
			const proto = { custom: 1 };
			const target = Object.create(proto) as CustomTarget;

			expect(() =>
				tweenNumber({ target, property: "custom", to: 2 }),
			).not.toThrow();
		});

		test.each([
			["NaN", Number.NaN],
			["Infinity", Number.POSITIVE_INFINITY],
			["-Infinity", Number.NEGATIVE_INFINITY],
			["a numeric string", "5" as unknown as number],
			["null", null as unknown as number],
		])("rejects %s as `from`", (_, value) => {
			expect(() =>
				tweenNumber({ target: createTarget(), property: "x", from: value }),
			).toThrow("from is not a valid value");
		});

		test.each([
			["NaN", Number.NaN],
			["Infinity", Number.POSITIVE_INFINITY],
			["a numeric string", "5" as unknown as number],
		])("rejects %s as `to`", (_, value) => {
			expect(() =>
				tweenNumber({ target: createTarget(), property: "x", to: value }),
			).toThrow("to is not a valid value");
		});

		test("accepts 0 as an explicit endpoint (not treated as omitted)", () => {
			const target = createTarget(500);
			const tween = tweenNumber({ target, property: "x", from: 0, to: 0, startTime, duration });
			tween.init();

			expect(tween.data).toEqual({ x: { from: 0, to: 0 } });
		});
	});

	describe("validation at init()", () => {
		test("throws if the property was removed after creation", () => {
			const target = createTarget() as CustomTarget;
			target.custom = startX;
			const tween = tweenNumber({ target, property: "custom", to: endX, startTime, duration });
			delete target.custom;

			expect(() => tween.init()).toThrow("property does not exist on target");
		});

		test("throws if a needed current value is not a finite number", () => {
			const target = createTarget() as CustomTarget;
			target.custom = Number.NaN;
			const tween = tweenNumber({ target, property: "custom", to: endX });

			expect(() => tween.init()).toThrow("current value is not a valid value");
		});

		test("does not read the current value when both endpoints are explicit", () => {
			const target = createTarget() as CustomTarget;
			target.custom = "not a number";
			const tween = tweenNumber({ target, property: "custom", from: 0, to: 1 });

			expect(() => tween.init()).not.toThrow();
		});
	});

	describe("validation at render()", () => {
		test("throws if the property was removed after init()", () => {
			const target = createTarget() as CustomTarget;
			target.custom = startX;
			const tween = tweenNumber({ target, property: "custom", to: endX, startTime, duration });
			tween.init();
			delete target.custom;

			expect(() => tween.render(at(0.5))).toThrow("property does not exist on target");
		});

		test("throws if init() was never called", () => {
			const tween = tweenNumber({
				target: createTarget(),
				property: "x",
				from: 0,
				to: 1,
				startTime,
				duration,
			});

			expect(() => tween.render(at(0.5))).toThrow("was init() called?");
		});

		test("throws if the tween data was corrupted", () => {
			const { tween } = createNumberTween();
			tween.data = { x: { from: "oops", to: 1 } };

			expect(() => tween.render(at(0.5))).toThrow("property data is invalid");
		});
	});
});

describe("tweenPoint", () => {
	const from = { x: -20, y: 10 };
	const to = { x: 20, y: 50 };

	const createPointTween = (
		overrides: Partial<PropertyTweenOptions<{ x: number; y: number }>> = {},
		target: KObject = createTarget(),
	) => {
		const tween = tweenPoint({
			target,
			property: "pos",
			from: { ...from },
			to: { ...to },
			startTime,
			duration,
			...overrides,
		});
		tween.init();
		return { target, tween };
	};

	describe("interpolation", () => {
		test.each([
			["before the start", startTime - 1, { x: -20, y: 10 }],
			["at the start", startTime, { x: -20, y: 10 }],
			["halfway", at(0.5), { x: 0, y: 30 }],
			["a quarter of the way", at(0.25), { x: -10, y: 20 }],
			["at the end", endTime, { x: 20, y: 50 }],
			["after the end", endTime + 1, { x: 20, y: 50 }],
		])("renders %s (t=%d)", (_, time, expected) => {
			const { target, tween } = createPointTween();
			tween.render(time);

			expect(target.pos.x).toBeCloseTo(expected.x, 10);
			expect(target.pos.y).toBeCloseTo(expected.y, 10);
		});

		test("applies easing to both axes", () => {
			const { target, tween } = createPointTween({ easing: (t) => t * t });
			tween.render(at(0.5));

			expect(target.pos.x).toBeCloseTo(lerp(from.x, to.x, 0.25), 10);
			expect(target.pos.y).toBeCloseTo(lerp(from.y, to.y, 0.25), 10);
		});

		test("seeks back after rendering the end", () => {
			const { target, tween } = createPointTween();

			tween.render(endTime);
			tween.render(startTime - 1);

			expect(target.pos).toEqual(from);
		});
	});

	describe("copy semantics", () => {
		test("mutating supplied `from`/`to` after creation does not change the range", () => {
			const mutableFrom = { ...from };
			const mutableTo = { ...to };
			const target = createTarget();
			const tween = tweenPoint({
				target,
				property: "pos",
				from: mutableFrom,
				to: mutableTo,
				startTime,
				duration,
			});

			mutableFrom.x = 999;
			mutableTo.y = 999;
			tween.init();
			tween.render(at(0.5));

			expect(target.pos).toEqual({ x: 0, y: 30 });
		});

		test("mutating supplied points after init() does not change the range", () => {
			const mutableTo = { ...to };
			const { target, tween } = createPointTween({ to: mutableTo });

			mutableTo.x = 999;
			tween.render(at(0.5));

			expect(target.pos).toEqual({ x: 0, y: 30 });
		});

		test("tween data holds its own copies, not the caller's objects", () => {
			const suppliedFrom = { ...from };
			const suppliedTo = { ...to };
			const { tween } = createPointTween({ from: suppliedFrom, to: suppliedTo });

			const range = (tween.data as { pos: { from: unknown; to: unknown } }).pos;
			expect(range.from).toEqual(from);
			expect(range.to).toEqual(to);
			expect(range.from).not.toBe(suppliedFrom);
			expect(range.to).not.toBe(suppliedTo);
		});

		test("a captured current position is a snapshot, not a live reference", () => {
			const target = createTarget(10, 20);
			const { tween } = createPointTween({ from: undefined }, target);

			target.pos = { x: 500, y: 500 }; // moved after init
			tween.reset();
			tween.render(startTime);

			expect(target.pos).toEqual({ x: 10, y: 20 });
		});
	});

	describe("omitted endpoints", () => {
		test("captures the current position at init() as `to` when `to` is omitted", () => {
			const target = createTarget(to.x, to.y);
			const { tween } = createPointTween({ to: undefined }, target);

			expect(tween.data).toEqual({ pos: { from, to } });
			tween.render(at(0.5));
			expect(target.pos).toEqual({ x: 0, y: 30 });
		});

		test("captures the current position at init() as `from` when `from` is omitted", () => {
			const target = createTarget(from.x, from.y);
			const { tween } = createPointTween({ from: undefined }, target);

			expect(tween.data).toEqual({ pos: { from, to } });
			tween.render(at(0.5));
			expect(target.pos).toEqual({ x: 0, y: 30 });
		});

		test("holds the captured position when both endpoints are omitted", () => {
			const target = createTarget(7, 9);
			const { tween } = createPointTween({ from: undefined, to: undefined }, target);

			target.pos = { x: 0, y: 0 };
			tween.render(at(0.5));

			expect(target.pos).toEqual({ x: 7, y: 9 });
		});
	});

	describe("validation", () => {
		test.each([
			["missing y", { x: 1 }],
			["missing x", { y: 1 }],
			["NaN coordinate", { x: Number.NaN, y: 0 }],
			["Infinity coordinate", { x: 0, y: Number.POSITIVE_INFINITY }],
			["null", null],
			["a number", 5],
			["a string", "1,2"],
		])("rejects %s as `from`", (_, value) => {
			expect(() =>
				tweenPoint({
					target: createTarget(),
					property: "pos",
					from: value as unknown as { x: number; y: number },
				}),
			).toThrow("from is not a valid value");
		});

		test("rejects an invalid `to`", () => {
			expect(() =>
				tweenPoint({
					target: createTarget(),
					property: "pos",
					to: { x: 1 } as unknown as { x: number; y: number },
				}),
			).toThrow("to is not a valid value");
		});

		test("throws when the property does not exist", () => {
			expect(() =>
				tweenPoint({ target: createTarget(), property: "nope", to: { ...to } }),
			).toThrow("property does not exist on target");
		});

		test("throws at init() if the current value is not a point", () => {
			const target = createTarget() as CustomTarget;
			target.custom = 5;
			const tween = tweenPoint({ target, property: "custom", to: { ...to } });

			expect(() => tween.init()).toThrow("current value is not a valid value");
		});

		test("throws at render() if the property was removed after init()", () => {
			const target = createTarget() as CustomTarget;
			target.custom = { ...from };
			const tween = tweenPoint({ target, property: "custom", to: { ...to }, startTime, duration });
			tween.init();
			delete target.custom;

			expect(() => tween.render(at(0.5))).toThrow("property does not exist on target");
		});
	});
});