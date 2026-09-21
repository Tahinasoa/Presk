// Parses and evaluates the arithmetic expression grammar from spec §8.2:
//
//   expr      := term (("+" | "-") term)*
//   term      := factor (("*" | "/") factor)*
//   factor    := number | reference
//   reference := identifier "." segment ("." segment)*
//   segment   := scalarProp | pointProp | "boundingBox"
//
// A reference must always terminate on a scalar prop. A point prop
// (topLeft, center, ...) may optionally be preceded by "boundingBox", but
// must then be followed by ".x" or ".y" — see spec §8.2 for the invalid
// examples this is meant to reject.
//
// TODO(spec §9): pathX/pathY/pathAngle function-call syntax is not part of
// this grammar yet — expressions using them will fail to parse.

import type KScene from "@/primitives/kscene";
import type { KPoint } from "@/primitives/types";

const SCALAR_PROPS = new Set(["x", "y", "width", "height", "scale", "rotation", "opacity"]);
const POINT_PROPS = new Set(["topLeft", "topRight", "bottomLeft", "bottomRight", "center"]);

type Token = { type: "number"; value: number } | { type: "ident"; value: string } | { type: "op"; value: string } | { type: "dot" };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const re = /\s*(?:([0-9]+(?:\.[0-9]+)?)|([A-Za-z_][A-Za-z0-9_]*)|(\.)|([+\-*/]))\s*/y;
  let index = 0;

  while (index < source.length) {
    re.lastIndex = index;
    const match = re.exec(source);
    if (!match || match.index !== index) {
      throw new Error(`Presk expression: unexpected character at position ${index} in "${source}".`);
    }
    const [full, number, ident, dot, op] = match;
    if (number !== undefined) tokens.push({ type: "number", value: Number(number) });
    else if (ident !== undefined) tokens.push({ type: "ident", value: ident });
    else if (dot !== undefined) tokens.push({ type: "dot" });
    else if (op !== undefined) tokens.push({ type: "op", value: op });
    index += full.length;
  }

  return tokens;
}

/** Resolves an identifier + dotted segment chain against the scene, per spec §8.2/§4. */
function resolveReference(scene: KScene, identifier: string, segments: string[]): number {
  const object = scene.get(identifier) as unknown as Record<string, unknown> | undefined;
  if (!object) {
    throw new Error(`Presk expression: unknown reference "${identifier}" (not created yet, or already destroyed).`);
  }

  let current: unknown = object;
  let boundingBox = false;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;

    if (segment === "boundingBox") {
      boundingBox = true;
      continue;
    }

    if (SCALAR_PROPS.has(segment)) {
      if (!isLast) {
        throw new Error(`Presk expression: "${segment}" is a scalar and cannot be followed by "${segments[i + 1]}".`);
      }
      const value = (current as Record<string, unknown>)[segment];
      if (typeof value !== "number") {
        throw new Error(`Presk expression: "${identifier}.${segment}" did not resolve to a number.`);
      }
      return value;
    }

    if (POINT_PROPS.has(segment)) {
      const source = boundingBox
        ? ((current as { boundingBox: Record<string, KPoint> }).boundingBox as Record<string, KPoint>)
        : (current as Record<string, KPoint>);
      const point = source[segment];
      if (!point) {
        throw new Error(`Presk expression: "${identifier}" has no "${boundingBox ? "boundingBox." : ""}${segment}".`);
      }
      const next = segments[i + 1];
      if (next !== "x" && next !== "y") {
        throw new Error(
          `Presk expression: "${segment}" is a point and must be followed by ".x" or ".y" (got ${next ?? "end of expression"}).`,
        );
      }
      return point[next];
    }

    throw new Error(`Presk expression: unknown property segment "${segment}" on "${identifier}".`);
  }

  throw new Error(`Presk expression: "${identifier}" reference must end on a scalar property.`);
}

/** Recursive-descent parser/evaluator. Small enough to inline parsing and evaluation in one pass. */
class Parser {
  private tokens: Token[];
  private pos = 0;
  private scene: KScene;

  constructor(tokens: Token[], scene: KScene) {
    this.tokens = tokens;
    this.scene = scene;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error("Presk expression: unexpected end of expression.");
    this.pos++;
    return token;
  }

  parseExpr(): number {
    let value = this.parseTerm();
    while (this.peek()?.type === "op" && (this.peek() as { value: string }).value.match(/[+-]/)) {
      const op = (this.next() as { value: string }).value;
      const rhs = this.parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek()?.type === "op" && (this.peek() as { value: string }).value.match(/[*/]/)) {
      const op = (this.next() as { value: string }).value;
      const rhs = this.parseFactor();
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  private parseFactor(): number {
    const token = this.next();
    if (token.type === "number") return token.value;

    if (token.type === "ident") {
      const identifier = token.value;
      const segments: string[] = [];
      while (this.peek()?.type === "dot") {
        this.next(); // consume "."
        const segmentToken = this.next();
        if (segmentToken.type !== "ident") {
          throw new Error("Presk expression: expected a property name after \".\".");
        }
        segments.push(segmentToken.value);
      }
      if (segments.length === 0) {
        throw new Error(`Presk expression: "${identifier}" used without a property (e.g. "${identifier}.x").`);
      }
      return resolveReference(this.scene, identifier, segments);
    }

    throw new Error(`Presk expression: unexpected token "${JSON.stringify(token)}".`);
  }
}

/**
 * Evaluates a Presk DSL expression string against the current scene state.
 * This is a *pull* evaluation: it always reads live, current values — call
 * it again to get an updated result (see binding/bindingEngine.ts).
 */
export function evaluateExpression(source: string, scene: KScene): number {
  const tokens = tokenize(source);
  const parser = new Parser(tokens, scene);
  const value = parser.parseExpr();
  return value;
}
