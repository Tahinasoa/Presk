import { describe, expect, it } from "vitest";
import { lerpColor, parseColor } from "@/geom/color";

describe("color helpers", () => {
  it("parses three and six digit hexadecimal colors case insensitively", () => {
    expect(parseColor("#ff0000")).toBe(0xff0000);
    expect(parseColor("#FF0000")).toBe(0xff0000);
    expect(parseColor("#f00")).toBe(0xff0000);
    expect(parseColor("#888")).toBe(0x888888);
  });

  it("parses named colors case insensitively", () => {
    expect(parseColor("blue")).toBe(0x0000ff);
    expect(parseColor("Blue")).toBe(0x0000ff);
  });

  it("accepts RGB integers including zero", () => {
    expect(parseColor(0x9c9c9c)).toBe(0x9c9c9c);
    expect(parseColor(0)).toBe(0);
  });

  it.each(["#ff", "#gggggg", "#1234567", "nope", -1, 0x1000000, 1.5, null, {}])(
    "rejects invalid color input %s",
    (input) => {
      expect(parseColor(input)).toBeNull();
    },
  );

  it("interpolates channels with rounding and clamping", () => {
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
    expect(lerpColor(0xff0000, 0x0000ff, 0)).toBe(0xff0000);
    expect(lerpColor(0xff0000, 0x0000ff, 1)).toBe(0x0000ff);
    expect(lerpColor(0x000000, 0xffffff, 1.5)).toBe(0xffffff);
  });
});
