import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";

describe("tokenize", () => {
  it("tokenizes dotted references", () => {
    expect(tokenize("a.b")).toEqual({
      ok: true,
      tokens: [
        { type: "ident", value: "a", pos: 0 },
        { type: "dot", pos: 1 },
        { type: "ident", value: "b", pos: 2 },
      ],
    });
  });

  it("tokenizes a reference and addition", () => {
    expect(tokenize("title.topRight.x + 20")).toEqual({
      ok: true,
      tokens: [
        { type: "ident", value: "title", pos: 0 },
        { type: "dot", pos: 5 },
        { type: "ident", value: "topRight", pos: 6 },
        { type: "dot", pos: 14 },
        { type: "ident", value: "x", pos: 15 },
        { type: "op", value: "+", pos: 17 },
        { type: "num", value: 20, pos: 19 },
      ],
    });
  });

  it("tokenizes a signed decimal expression", () => {
    expect(tokenize("-3.5*x")).toEqual({
      ok: true,
      tokens: [
        { type: "op", value: "-", pos: 0 },
        { type: "num", value: 3.5, pos: 1 },
        { type: "op", value: "*", pos: 4 },
        { type: "ident", value: "x", pos: 5 },
      ],
    });
  });

  it("tokenizes indexed reference segments", () => {
    expect(tokenize("v.vertex[1].y")).toEqual({
      ok: true,
      tokens: [
        { type: "ident", value: "v", pos: 0 },
        { type: "dot", pos: 1 },
        { type: "ident", value: "vertex", pos: 2 },
        { type: "lbracket", pos: 8 },
        { type: "num", value: 1, pos: 9 },
        { type: "rbracket", pos: 10 },
        { type: "dot", pos: 11 },
        { type: "ident", value: "y", pos: 12 },
      ],
    });
  });

  it("tokenizes path function punctuation and a negative argument", () => {
    expect(tokenize("c.pathX(main, -0.5)")).toEqual({
      ok: true,
      tokens: [
        { type: "ident", value: "c", pos: 0 },
        { type: "dot", pos: 1 },
        { type: "ident", value: "pathX", pos: 2 },
        { type: "lparen", pos: 7 },
        { type: "ident", value: "main", pos: 8 },
        { type: "comma", pos: 12 },
        { type: "op", value: "-", pos: 14 },
        { type: "num", value: 0.5, pos: 15 },
        { type: "rparen", pos: 18 },
      ],
    });
  });

  it("ignores whitespace", () => {
    expect(tokenize("  \t\n ")).toEqual({ ok: true, tokens: [] });
  });

  it("reports an unexpected character at its source position", () => {
    expect(tokenize("a $ b")).toEqual({
      ok: false,
      message: "unexpected character '$' at 2",
      pos: 2,
    });
  });

  it("does not absorb a trailing dot into a number", () => {
    expect(tokenize("3.")).toEqual({
      ok: true,
      tokens: [
        { type: "num", value: 3, pos: 0 },
        { type: "dot", pos: 1 },
      ],
    });
  });
});
