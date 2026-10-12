import { describe, expect, it } from "vitest";
import KObject from "./kobject";

const opts = { id: "tween-id", startTime: 0, duration: 10 };

const make = () =>
	new KObject({ id: "hero", x: 0, y: 0, rotation: 0, scale: 1 });

describe("KObject.getTweens", () => {
	it("returns a tween that transforms a property", () => {
		const obj = new KObject({ id: "hero", x: 0, y: 0 });

		const tweens = obj.getTweens({ x: 100 }, {
			id: "tween-id",
			startTime: 0,
			duration: 10,
		});

		expect(tweens).toHaveLength(1);
		tweens[0].init();
		tweens[0].render(tweens[0].endTime);
		expect(obj.x).toBe(100);
	});

	it("returns one tween per property", () => {
		expect(make().getTweens({ x: 100, y: 50 }, opts)).toHaveLength(2);
		expect(make().getTweens({ pos: { x: 100, y: 50 } }, opts)).toHaveLength(1);
		expect(make().getTweens({ x: 100, rotation: 90, scale: 2 }, opts)).toHaveLength(3);
	});

	it("sets target, startTime and endTime on the tween", () => {
		const obj = make();
		const [tween] = obj.getTweens({ x: 100 }, { ...opts, startTime: 2, duration: 5 });

		expect(tween.target).toBe(obj);
		expect(tween.startTime).toBe(2);
		expect(tween.endTime).toBe(7);
	});

	it("does not change the object until render", () => {
		const obj = make();
		const [tween] = obj.getTweens({ x: 100 }, opts);

		tween.init();

		expect(obj.x).toBe(0);
	});

	it("throws at creation if a property has no tween factory", () => {
		expect(() => make().getTweens({ nope: 1 } as never, opts)).toThrow(/nope/);
	});

	describe("x", () => {
		it("goes from start to end, linearly", () => {
			const obj = make();
			const [tween] = obj.getTweens({ x: 100 }, opts);

			tween.init();
			tween.render(5);
			expect(obj.x).toBeCloseTo(50);

			tween.render(10);
			expect(obj.x).toBe(100);
		});
	});

	describe("y", () => {
		it("goes from start to end, linearly", () => {
			const obj = make();
			const [tween] = obj.getTweens({ y: 50 }, opts);

			tween.init();
			tween.render(5);
			expect(obj.y).toBeCloseTo(25);

			tween.render(10);
			expect(obj.y).toBe(50);
		});
	});

	describe("pos", () => {
		it("goes from start to end, linearly", () => {
			const obj = make();
			const [tween] = obj.getTweens({ pos: { x: 100, y: 50 } }, opts);

			tween.init();
			tween.render(5);
			expect(obj.pos.x).toBeCloseTo(50);
			expect(obj.pos.y).toBeCloseTo(25);

			tween.render(10);
			expect(obj.pos.x).toBe(100);
			expect(obj.pos.y).toBe(50);
		});
	});

	describe("rotation", () => {
		it("goes from start to end, linearly", () => {
			const obj = make();
			const [tween] = obj.getTweens({ rotation: 90 }, opts);

			tween.init();
			tween.render(5);
			expect(obj.rotation).toBeCloseTo(45);

			tween.render(10);
			expect(obj.rotation).toBe(90);
		});
	});

	describe("scale", () => {
		it("goes from start to end, linearly", () => {
			const obj = make();
			const [tween] = obj.getTweens({ scale: 3 }, opts);

			tween.init();
			tween.render(5);
			expect(obj.scale).toBeCloseTo(2);

			tween.render(10);
			expect(obj.scale).toBe(3);
		});
	});

	describe("timing and easing (any property)", () => {
		it("starts from the value the object has at init, not at creation", () => {
			const obj = make();
			const [tween] = obj.getTweens({ x: 100 }, opts);

			obj.x = 20;
			tween.init();
			tween.render(5);

			expect(obj.x).toBeCloseTo(60);
		});

		it("holds the start value before startTime and the end value after endTime", () => {
			const obj = make();
			const [tween] = obj.getTweens({ x: 100 }, { ...opts, startTime: 5 });

			tween.init();
			tween.render(0);
			expect(obj.x).toBe(0);

			tween.render(999);
			expect(obj.x).toBe(100);
		});

		it("goes back to the start value when seeking backwards", () => {
			const obj = make();
			const [tween] = obj.getTweens({ x: 100 }, opts);

			tween.init();
			tween.render(10);
			tween.render(0);

			expect(obj.x).toBe(0);
		});

		it("applies the easing function", () => {
			const obj = make();
			const [tween] = obj.getTweens({ x: 100 }, { ...opts, easing: (t) => t * t });

			tween.init();
			tween.render(5);

			expect(obj.x).toBeCloseTo(25);
		});
	});
});