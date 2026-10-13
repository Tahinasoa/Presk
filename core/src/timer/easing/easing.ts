import type { EasingFunction } from "./easing/types";
import * as easingLibrary from "./easing/index";

export type { EasingFunction };

type LibraryEasingName = keyof typeof easingLibrary;
export type EasingName = LibraryEasingName;

export const easings: Record<EasingName, EasingFunction> = easingLibrary;

export const easingNames = Object.keys(easings) as EasingName[];

export * from "./easing/index";
