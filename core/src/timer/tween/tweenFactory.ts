import KTween from "@/timer/tween/tween";
import type KObject from "@/primitives/kobject";
import type { KPoint } from "@/primitives/types";

export interface PropertyTweenOptions<V> {
	target: KObject;
	property: string;
	from?: V;
	to?: V;
	startTime?: number;
	duration?: number;
	easing?: (t: number) => number;
}

interface TweenValue<V> {
	isValid(value: unknown): value is V;
	copy(value: V): V;
	interpolate(from: V, to: V, progress: number): V;
}

const numberValue: TweenValue<number> = {
	isValid: (value): value is number =>
		typeof value === "number" && Number.isFinite(value),
	copy: (value) => value,
	interpolate: (from, to, progress) => from + (to - from) * progress,
};

const pointValue: TweenValue<KPoint> = {
	isValid: (value): value is KPoint =>
		typeof value === "object" &&
		value !== null &&
		Number.isFinite((value as KPoint).x) &&
		Number.isFinite((value as KPoint).y),
	copy: (value) => ({ x: value.x, y: value.y }),
	interpolate: (from, to, progress) => ({
		x: from.x + (to.x - from.x) * progress,
		y: from.y + (to.y - from.y) * progress,
	}),
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function assertPropertyExists(target: object, property: string): void {
	if (!(property in target)) {
		throw new Error(`Cannot tween '${property}': property does not exist on target`);
	}
}

function assertWritable(target: object, property: string): void {
	for (let object: object | null = target; object !== null; object = Object.getPrototypeOf(object)) {
		const descriptor = Object.getOwnPropertyDescriptor(object, property);
		if (!descriptor) continue;

		if (descriptor.set || descriptor.writable) return;
		throw new Error(`Cannot tween '${property}': property is not writable`);
	}

	throw new Error(`Cannot tween '${property}': property does not exist on target`);
}

function propertyTween<V>(
	options: PropertyTweenOptions<V>,
	valueType: TweenValue<V>,
): KTween {
	const {
		target,
		property,
		from,
		to,
		startTime = 0,
		duration = 1,
		easing,
	} = options;
	const hasFrom = from !== undefined;
	const hasTo = to !== undefined;

	assertWritable(target, property);

	if (hasFrom && !valueType.isValid(from)) {
		throw new Error(`Cannot tween '${property}': from is not a valid value`);
	}
	if (hasTo && !valueType.isValid(to)) {
		throw new Error(`Cannot tween '${property}': to is not a valid value`);
	}

	const explicitFrom = hasFrom ? valueType.copy(from) : undefined;
	const explicitTo = hasTo ? valueType.copy(to) : undefined;

	return new KTween({
		target,
		startTime,
		duration,
		easing,
		init: (object, tween) => {
			assertPropertyExists(object, property);
			const properties = object as unknown as Record<string, unknown>;
			const needsCurrent = explicitFrom === undefined || explicitTo === undefined;
			const current = needsCurrent ? properties[property] : undefined;

			if (needsCurrent && !valueType.isValid(current)) {
				throw new Error(`Cannot tween '${property}': current value is not a valid value`);
			}

			const resolvedFrom = explicitFrom ?? current as V;
			const resolvedTo = explicitTo ?? current as V;
			tween.data = {
				[property]: {
					from: valueType.copy(resolvedFrom),
					to: valueType.copy(resolvedTo),
				},
			};
		},
		render: (object, progress, data) => {
			assertPropertyExists(object, property);
			const range = data?.[property];
			if (!isRecord(range)) {
				throw new Error(`Tween on '${property}': property data is not defined (was init() called?)`);
			}

			const { from, to } = range;
			if (!valueType.isValid(from) || !valueType.isValid(to)) {
				throw new Error(`Tween on '${property}': property data is invalid`);
			}
			(object as unknown as Record<string, unknown>)[property] =
				valueType.interpolate(from, to, progress);
		},
	});
}

export function tweenNumber(options: PropertyTweenOptions<number>): KTween {
	return propertyTween(options, numberValue);
}

export function tweenPoint(options: PropertyTweenOptions<KPoint>): KTween {
	return propertyTween(options, pointValue);
}
