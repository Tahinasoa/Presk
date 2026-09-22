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
//
// TODO(spec §9): pathX/pathY/pathAngle function-call syntax is not part of
// this grammar yet — expressions using them will fail to parse.

import type KScene from "@/primitives/kscene";

type Token = { type: "number"; value: number } | { type: "ident"; value: string } | { type: "op"; value: string } | { type: "dot" };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  // Tokenizer regex using the sticky 'y' flag:
  // - \s* : consumes leading whitespace around tokens
  // - Group 1 ([0-9]+(?:\.[0-9]+)?): matches integer or floating-point numbers
  // - Group 2 ([A-Za-z_][A-Za-z0-9_]*): matches identifiers (object IDs, property names)
  // - Group 3 (\.): matches dots for property/point access chaining
  // - Group 4 ([+\-*/]): matches arithmetic operators
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

/** Resolves an identifier + dotted segment chain generically against the scene. */
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
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
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
      if (typeof value !== "number" || typeof rhs !== "number") {
        throw new Error("Presk expression: arithmetic operations require scalar (number) operands.");
      }
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
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
      const val = resolveReference(this.scene, identifier, segments);
      return val as number;
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
