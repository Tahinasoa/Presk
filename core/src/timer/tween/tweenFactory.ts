import KTween from "../tween";
import type { KTweenData } from "../tween";
import type KObject from "@/primitives/kobject";
import type { KPoint } from "@/primitives/types";

/**
 * Property tween factories.
 *
 * Start / end resolution:
 *   - start and end given  -> animate start -> end
 *   - only start given     -> animate start -> current value (read in init)
 *   - only end given       -> animate current value (read in init) -> end
 *   - neither given        -> error (a tween without any destination is a mistake)
 *
 * Strictness:
 *   - The factory throws immediately if the property is missing, has no setter /
 *     is not writable, if a provided start / end is not a valid value, or, when
 *     the current value is needed, if the property cannot be read or currently
 *     holds an invalid value (wrong type).
 *   - When both start and end are provided, startData / endData are defined as
 *     soon as the factory returns.
 *   - Otherwise they are defined at the end of init(), because the current value
 *     may only be read there (see the KTween contract). init() re-checks the
 *     value as a safety net; it only throws if the scene changed type since the
 *     factory was called, which breaks the contract.
 *   - render() never falls back on anything: missing data throws.
 */

export interface PropertyTweenOptions<V> {
	target: KObject;
	property: string;
	start?: V;
	end?: V;
	startTime?: number;
	duration?: number;
	easing?: (t: number) => number;
}

/** How to validate, copy and interpolate a given kind of value. */
interface ValueKind<V> {
	name: string;
	isValid(value: unknown): value is V;
	clone(value: V): V;
	lerp(from: V, to: V, t: number): V;
}

// ── Value kinds ───────────────────────────────────────────────────────────

const numberKind: ValueKind<number> = {
	name: "number",
	isValid: (v): v is number => typeof v === "number" && Number.isFinite(v),
	clone: (v) => v,
	lerp: (a, b, t) => a + (b - a) * t,
};

const pointKind: ValueKind<KPoint> = {
	name: "KPoint",
	isValid: (v): v is KPoint =>
		typeof v === "object" &&
		v !== null &&
		Number.isFinite((v as KPoint).x) &&
		Number.isFinite((v as KPoint).y),
	clone: (p) => ({ x: p.x, y: p.y }),
	lerp: (a, b, t) => ({
		x: a.x + (b.x - a.x) * t,
		y: a.y + (b.y - a.y) * t,
	}),
};

// ── Property access checks ────────────────────────────────────────────────

/** Finds a property descriptor on the object or anywhere up its prototype chain. */
function findDescriptor(obj: object, property: string): PropertyDescriptor | undefined {
	for (let o: object | null = obj; o !== null; o = Object.getPrototypeOf(o)) {
		const descriptor = Object.getOwnPropertyDescriptor(o, property);
		if (descriptor) return descriptor;
	}
	return undefined;
}

function assertWritable(target: object, property: string): void {
	const descriptor = findDescriptor(target, property);
	if (!descriptor) {
		throw new Error(`Cannot tween '${property}': property does not exist on target`);
	}
	const writable = descriptor.set !== undefined || descriptor.writable === true;
	if (!writable) {
		throw new Error(`Cannot tween '${property}': property has no setter and is not writable`);
	}
}

function assertReadable(target: object, property: string): void {
	const descriptor = findDescriptor(target, property);
	const readable = descriptor !== undefined && (descriptor.get !== undefined || "value" in descriptor);
	if (!readable) {
		throw new Error(`Cannot tween '${property}': current value is needed but property cannot be read`);
	}
}

function assertValid<V>(kind: ValueKind<V>, value: unknown, property: string, label: string): asserts value is V {
	if (!kind.isValid(value)) {
		throw new Error(`Cannot tween '${property}': ${label} is not a valid ${kind.name}`);
	}
}

function unwrap<V>(data: KTweenData | undefined, property: string, label: string): V {
	if (!data || !("value" in data) || data.value === undefined) {
		throw new Error(`Tween on '${property}': ${label} is not defined (was init() called?)`);
	}
	return data.value as V;
}

// ── Generic factory ───────────────────────────────────────────────────────

function propertyTween<V>(options: PropertyTweenOptions<V>, kind: ValueKind<V>): KTween {
	const { target, property, startTime = 0, duration = 1, easing } = options;
	const slot = (obj: KObject) => obj as unknown as Record<string, unknown>;

	const hasStart = options.start !== undefined;
	const hasEnd = options.end !== undefined;

	// Fail before returning anything.
	if (!hasStart && !hasEnd) {
		throw new Error(`Cannot tween '${property}': provide at least 'start' or 'end'`);
	}
	assertWritable(target, property);
	if (!hasStart || !hasEnd) {
		assertReadable(target, property);
		// Fail fast on a wrong type (e.g. a string, a missing point). The value
		// actually animated is still read in init(), after the previous tweens.
		assertValid(kind, slot(target)[property], property, "current value");
	}
	if (hasStart) assertValid(kind, options.start, property, "start");
	if (hasEnd) assertValid(kind, options.end, property, "end");

	// Private copies: later changes by the caller must not affect the tween.
	const explicitStart = hasStart ? kind.clone(options.start as V) : undefined;
	const explicitEnd = hasEnd ? kind.clone(options.end as V) : undefined;

	return new KTween({
		target,
		startTime,
		duration,
		easing,

		// Fully explicit: data is defined as soon as the factory returns.
		startData: explicitStart !== undefined && explicitEnd !== undefined
			? { value: kind.clone(explicitStart) }
			: undefined,
		endData: explicitStart !== undefined && explicitEnd !== undefined
			? { value: kind.clone(explicitEnd) }
			: undefined,

		init: (obj, tween) => {
			let start = explicitStart;
			let end = explicitEnd;

			if (start === undefined || end === undefined) {
				const current = slot(obj)[property];
				assertValid(kind, current, property, "current value");
				start ??= current;
				end ??= current;
			}

			tween.startData = { value: kind.clone(start) };
			tween.endData = { value: kind.clone(end) };
		},

		render: (obj, progress, startData, endData) => {
			const from = unwrap<V>(startData, property, "startData");
			const to = unwrap<V>(endData, property, "endData");
			slot(obj)[property] = kind.lerp(from, to, progress);
		},
	});
}

// ── Public factories ──────────────────────────────────────────────────────

export function tweenNumber(options: PropertyTweenOptions<number>): KTween {
	return propertyTween(options, numberKind);
}

export function tweenPoint(options: PropertyTweenOptions<KPoint>): KTween {
	return propertyTween(options, pointKind);
}