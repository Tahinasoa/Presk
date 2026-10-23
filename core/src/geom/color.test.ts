import { describe, expect, it } from "vitest";
import { colorFromRgba, lerpColor, lerpColorCanonical, parseColor, parseColorCanonical, splitColor } from "@/geom/color";

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

  describe("canonical color helpers", () => {
    it("parses canonical and shorthand hex, named colors, and integers", () => {
      expect(parseColorCanonical("#ff0000")).toBe("#ff0000");
      expect(parseColorCanonical("#F00")).toBe("#ff0000");
      expect(parseColorCanonical("#888")).toBe("#888888");
      expect(parseColorCanonical("blue")).toBe("#0000ff");
      expect(parseColorCanonical("Blue")).toBe("#0000ff");
      expect(parseColorCanonical(0x9c9c9c)).toBe("#9c9c9c");
      expect(parseColorCanonical(0)).toBe("#000000");
      expect(parseColorCanonical("#f008")).toBe("#ff000088");
      expect(parseColorCanonical("#ff000080")).toBe("#ff000080");
      expect(parseColorCanonical("#FF000080")).toBe("#ff000080");
      expect(parseColorCanonical("#ff0000ff")).toBe("#ff0000");
      expect(parseColorCanonical("#f00f")).toBe("#ff0000");
      expect(parseColorCanonical("#ff000000")).toBe("#ff000000");
    });

    it.each(["nope", "#ff", "#12345", "#gggggg", "#1234567", "", -1, 0x1000000, 1.5, null, {}])(
      "rejects invalid canonical color input %p",
      (input) => {
        expect(parseColorCanonical(input)).toBeNull();
      },
    );

    it("splits colors into rgb and alpha", () => {
      const s1 = splitColor("#ff000080");
      expect(s1.rgb).toBe(0xff0000);
      expect(s1.alpha).toBeCloseTo(0.502, 3);

      const s2 = splitColor("#00ff00");
      expect(s2).toEqual({ rgb: 0x00ff00, alpha: 1 });

      const s3 = splitColor(0x9c9c9c);
      expect(s3).toEqual({ rgb: 0x9c9c9c, alpha: 1 });
    });

    it("throws on invalid splitColor inputs", () => {
      expect(() => splitColor("nope")).toThrow();
      expect(() => splitColor("red")).toThrow();
      expect(() => splitColor(-1)).toThrow();
    });

    it("creates colors from rgba values with clamping and rounding", () => {
      expect(colorFromRgba(255, 0, 0, 1)).toBe("#ff0000");
      expect(colorFromRgba(255, 0, 0, 0.5)).toBe("#ff000080");
      expect(colorFromRgba(255, 0, 0, 0)).toBe("#ff000000");
      expect(colorFromRgba(300, -5, 0, 2)).toBe("#ff0000");
    });

    it("interpolates canonical colors with alpha", () => {
      expect(lerpColorCanonical("#000000", "#ffffff", 0.5)).toBe("#808080");
      expect(lerpColorCanonical("#ff0000", "#0000ff", 0)).toBe("#ff0000");
      expect(lerpColorCanonical("#ff0000", "#0000ff", 1)).toBe("#0000ff");
      expect(lerpColorCanonical("#000000", "#ffffff", 1.5)).toBe("#ffffff");
      expect(lerpColorCanonical("#ff000000", "#ff0000ff", 0.5)).toBe("#ff000080");
      expect(lerpColorCanonical("#ff0000", "#ff000000", 1)).toBe("#ff000000");
    });
  });
});
