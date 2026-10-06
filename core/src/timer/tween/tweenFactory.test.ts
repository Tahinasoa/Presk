import KObject from "@/primitives/kobject";
import { describe, expect, test } from "vitest";
import { tweenNumber, tweenPoint } from "./tweenFactory";

describe("tween factories", () => {
	const startTime = 5;
	const duration = 10;
	const startX = -100;
	const endX = 200;

	function createNumberTween() {
		const target = new KObject({ id: "obj", x: 0, y: 0 });
		const tween = tweenNumber({
			target,
			property: "x",
			start: startX,
			end: endX,
			startTime,
			duration,
		});

		return { target, tween };
	}

	test("renders the start value before the tween starts", () => {
		const { target, tween } = createNumberTween();

		tween.render(startTime - 1);

		expect(target.x).toBe(startX);
	});

	test("renders the start value at the start time", () => {
		const { target, tween } = createNumberTween();

		tween.render(startTime);

		expect(target.x).toBe(startX);
	});

	test("interpolates a number at an arbitrary time", () => {
		const { target, tween } = createNumberTween();

		tween.render(startTime + duration / 2);

		expect(target.x).toBe((startX + endX) / 2);
	});

	test("renders the end value after the tween ends", () => {
		const { target, tween } = createNumberTween();

		tween.render(startTime + duration + 1);

		expect(target.x).toBe(endX);
	});

	test("can seek to an arbitrary time after rendering the end value", () => {
		const { target, tween } = createNumberTween();

		tween.render(startTime + duration);
		tween.render(startTime + duration / 4);

		expect(target.x).toBe(startX + (endX - startX) / 4);
	});

	test("uses the current value at init as the end when end is omitted", () => {
		const target = new KObject({ id: "obj", x: 0, y: 0 });
		const tween = tweenNumber({
			target,
			property: "x",
			start: startX,
			startTime,
			duration,
		});
		target.x = endX;

		tween.init();
		tween.render(startTime + duration / 2);

		expect(target.x).toBe((startX + endX) / 2);
	});

	test("uses the current value at init as the start when start is omitted", () => {
		const target = new KObject({ id: "obj", x: 0, y: 0 });
		const tween = tweenNumber({
			target,
			property: "x",
			end: endX,
			startTime,
			duration,
		});
		target.x = startX;

		tween.init();
		tween.render(startTime + duration / 2);

		expect(target.x).toBe((startX + endX) / 2);
	});

	test("tweens the pos point property", () => {
		const target = new KObject({ id: "obj", x: 0, y: 0 });
		const start = { x: -20, y: 10 };
		const end = { x: 20, y: 50 };
		const tween = tweenPoint({
			target,
			property: "pos",
			start,
			end,
			startTime,
			duration,
		});

		tween.render(startTime + duration / 2);

		expect(target.pos).toEqual({ x: 0, y: 30 });
	});
});
