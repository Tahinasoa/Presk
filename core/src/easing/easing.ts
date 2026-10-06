import type { EasingFunction } from "./easing/types";
import { easeInSine } from "./easing/easeInSine";
import { easeOutSine } from "./easing/easeOutSine";
import { easeInOutSine } from "./easing/easeInOutSine";
import { easeInQuad } from "./easing/easeInQuad";
import { easeOutQuad } from "./easing/easeOutQuad";
import { easeInOutQuad } from "./easing/easeInOutQuad";
import { easeInCubic } from "./easing/easeInCubic";
import { easeOutCubic } from "./easing/easeOutCubic";
import { easeInOutCubic } from "./easing/easeInOutCubic";
import { easeInQuart } from "./easing/easeInQuart";
import { easeOutQuart } from "./easing/easeOutQuart";
import { easeInOutQuart } from "./easing/easeInOutQuart";
import { easeInQuint } from "./easing/easeInQuint";
import { easeOutQuint } from "./easing/easeOutQuint";
import { easeInOutQuint } from "./easing/easeInOutQuint";
import { easeInExpo } from "./easing/easeInExpo";
import { easeOutExpo } from "./easing/easeOutExpo";
import { easeInOutExpo } from "./easing/easeInOutExpo";
import { easeInCirc } from "./easing/easeInCirc";
import { easeOutCirc } from "./easing/easeOutCirc";
import { easeInOutCirc } from "./easing/easeInOutCirc";
import { easeInBack } from "./easing/easeInBack";
import { easeOutBack } from "./easing/easeOutBack";
import { easeInOutBack } from "./easing/easeInOutBack";
import { easeInElastic } from "./easing/easeInElastic";
import { easeOutElastic } from "./easing/easeOutElastic";
import { easeInOutElastic } from "./easing/easeInOutElastic";
import { easeInBounce } from "./easing/easeInBounce";
import { easeOutBounce } from "./easing/easeOutBounce";
import { easeInOutBounce } from "./easing/easeInOutBounce";

export type { EasingFunction };

export type EasingName =
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce";

export const easings: Record<EasingName, EasingFunction> = {
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
};

export const easingNames = Object.keys(easings) as EasingName[];

export {
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
};
