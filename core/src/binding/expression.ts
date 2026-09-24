// Parses and evaluates the arithmetic expression grammar from spec §8.2:
//
//   expr      := term (("+" | "-") term)*
//   term      := factor (("*" | "/") factor)*
//   factor    := number | reference
//   reference := identifier "." segment ("." segment)*
//   segment   := scalarProp | pointProp | "boundingBox" | "pos"
//
// A numeric expression must ultimately evaluate to a scalar (either via a scalar prop
// like `x`, `y`, width, height, etc., or by selecting `.x` / `.y` from a point prop
// or the `pos` object). Point props or `pos` may also be preceded by "boundingBox".
// See spec §8.2 for the invalid examples this is meant to reject.

import type KScene from "@/primitives/kscene";
import type { KPoint } from "@/primitives/types";

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

function resolveReference(scene: KScene, identifier: string, segments: string[]): unknown {
  const object = scene.get(identifier) as unknown as Record<string, unknown> | undefined;
  if (!object) {
    throw new Error(`Presk expression: unknown reference "${identifier}" (not created yet, or already destroyed).`);
  }

  let current: unknown = object;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      throw new Error(`Presk expression: cannot access property "${segment}" on null or undefined reference "${identifier}".`);
    }
    if (typeof current !== "object" || !(segment in (current as object))) {
      throw new Error(`Presk expression: property "${segment}" does not exist on reference "${identifier}" (or intermediate object).`);
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

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

  parseExpr(): number | KPoint {
    let value = this.parseTerm();
    while (this.peek()?.type === "op" && (this.peek() as { value: string }).value.match(/[+-]/)) {
      const op = (this.next() as { value: string }).value;
      const rhs = this.parseTerm();
      if (typeof value !== "number" || typeof rhs !== "number") {
        throw new Error("Presk expression: arithmetic operations require scalar (number) operands.");
      }
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number | KPoint {
    let value = this.parseFactor();
    while (this.peek()?.type === "op" && (this.peek() as { value: string }).value.match(/[*/]/)) {
      const op = (this.next() as { value: string }).value;
      const rhs = this.parseFactor();
      if (typeof value !== "number" || typeof rhs !== "number") {
        throw new Error("Presk expression: arithmetic operations require scalar (number) operands.");
      }
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  private parseFactor(): number | KPoint {
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
      const val = resolveReference(this.scene, identifier, segments);
      return val as number | KPoint;
    }

    throw new Error(`Presk expression: unexpected token "${JSON.stringify(token)}".`);
  }
}

export function evaluateExpression(source: string, scene: KScene): number | KPoint {
  const tokens = tokenize(source);
  const parser = new Parser(tokens, scene);
  const value = parser.parseExpr();
  return value;
}
