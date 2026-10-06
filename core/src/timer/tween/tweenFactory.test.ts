import KObject from "@/primitives/kobject";
import { describe, expect, test } from "vitest";
import { tweenNumber, tweenPoint } from "./tweenFactory";

describe("tween factories", () => {
	const startTime = 5;
	const duration = 10;
	const startX = -100;
	const endX = 200;

	const createNumberTween = (target = new KObject({ id: "obj", x: 0, y: 0 }), overrides = {}) => {
		const tween = tweenNumber({
			target,
			property: "x",
			start: startX,
			end: endX,
			startTime,
			duration,
			...overrides,
		});
		tween.init();

		return { target, tween };
	};

	const expectXAt = (state, time, expected) => {
		state.tween.render(time);
		expect(state.target.x).toBe(expected);
	};

	test.each([
		["before the tween starts", startTime - 1, startX],
		["at the start time", startTime, startX],
		["halfway through the tween", startTime + duration / 2, (startX + endX) / 2],
		["after the tween ends", startTime + duration + 1, endX],
	])("renders the %s value", (_, time, expected) => {
		const state = createNumberTween();
		expectXAt(state, time, expected);
	});

	test("can seek to an arbitrary time after rendering the end value", () => {
		const state = createNumberTween();
		const seekTime = startTime + duration / 4;

		state.tween.render(startTime + duration);
		expectXAt(state, seekTime, startX + (endX - startX) / 4);
	});

	test("uses the current value at init as the end when end is omitted", () => {
		const target = new KObject({ id: "obj", x: endX, y: 0 });
		const tween = tweenNumber({
			target,
			property: "x",
			start: startX,
			startTime,
			duration,
		});
		tween.init();
		tween.render(startTime + duration / 2);

		expect(target.x).toBe((startX + endX) / 2);
	});

	test("uses the current value at init as the start when start is omitted", () => {
		const target = new KObject({ id: "obj", x: startX, y: 0 });
		const tween = tweenNumber({
			target,
			property: "x",
			end: endX,
			startTime,
			duration,
		});
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
		tween.init();
		tween.render(startTime + duration / 2);

		expect(target.pos).toEqual({ x: 0, y: 30 });
	});
});
