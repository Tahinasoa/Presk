import { describe, expect, it } from "vitest";
import KAbstractRectangle from "./kabstractRectangle";

class TestRectangle extends KAbstractRectangle {}

const options = { id: "rectangle-tween", startTime: 0, duration: 10 };

const makeRectangle = () =>
	new TestRectangle({
		id: "rect",
		x: 100,
		y: 200,
		width: 100,
		height: 60,
	});

const pointAnchors = [
	"topLeft",
	"topCenter",
	"topRight",
	"leftCenter",
	"center",
	"rightCenter",
	"bottomLeft",
	"bottomCenter",
	"bottomRight",
] as const;

describe("KAbstractRectangle.getTweens", () => {
	it.each([
		["x", { x: 150 }],
		["rotation", { rotation: Math.PI / 2 }],
		["scale", { scale: 2 }],
	] as const)("animates inherited KObject property %s", (_property, properties) => {
		const rect = makeRectangle();
		const [tween] = rect.getTweens(properties, options);

		tween.init();
		tween.render(tween.endTime);

		expect(rect[_property]).toBe(Object.values(properties)[0]);
	});

	it.each(pointAnchors)("animates the %s point anchor", (property) => {
		const rect = makeRectangle();
		const initialPoint = { ...rect[property] };
		const destination = { x: initialPoint.x + 40, y: initialPoint.y + 20 };
		const [tween] = rect.getTweens({ [property]: destination }, options);

		rect.x += 10;
		rect.y += 5;
		const startAtInit = { ...rect[property] };

		tween.init();

		expect(tween.data?.[property]).toEqual({
			from: startAtInit,
			to: destination,
		});
		expect(rect[property]).toEqual(startAtInit);

		tween.render(5);
		expect(rect[property].x).toBeCloseTo((startAtInit.x + destination.x) / 2);
		expect(rect[property].y).toBeCloseTo((startAtInit.y + destination.y) / 2);

		tween.render(tween.endTime);
		expect(rect[property]).toEqual(destination);
	});
});
