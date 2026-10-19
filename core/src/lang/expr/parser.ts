import type { BinaryOp, Expr, RefSegment } from "./ast";
import { tokenize } from "./tokenizer";
import type { Token } from "./tokenizer";

export type ParseResult = { ok: true; expr: Expr } | { ok: false; message: string };

class ArithmeticParser {
  private readonly tokens: Token[];
  private position = 0;
  private errorMessage: string | null = null;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expr | null {
    const expression = this.parseExpr();
    if (!expression || this.position !== this.tokens.length) {
      return null;
    }
    return expression;
  }

  get message(): string {
    return this.errorMessage ?? "invalid expression";
  }

  private parseExpr(): Expr | null {
    let expression = this.parseTerm();
    if (!expression) {
      return null;
    }

    while (this.isOperator("+") || this.isOperator("-")) {
      const operator = this.consumeOperator();
      const right = this.parseTerm();
      if (!right) {
        return null;
      }
      expression = { kind: "bin", op: operator, left: expression, right };
    }

    return expression;
  }

  private parseTerm(): Expr | null {
    let expression = this.parseUnary();
    if (!expression) {
      return null;
    }

    while (this.isOperator("*") || this.isOperator("/")) {
      const operator = this.consumeOperator();
      const right = this.parseUnary();
      if (!right) {
        return null;
      }
      expression = { kind: "bin", op: operator, left: expression, right };
    }

    return expression;
  }

  private parseUnary(): Expr | null {
    if (this.isOperator("-")) {
      this.position += 1;
      const operand = this.parseUnary();
      return operand ? { kind: "neg", operand } : null;
    }
    return this.parseAtom();
  }

  private parseAtom(): Expr | null {
    const token = this.tokens[this.position];
    if (!token) {
      return null;
    }
    if (token.type === "num") {
      this.position += 1;
      return { kind: "num", value: token.value };
    }
    if (token.type === "ident") {
      this.position += 1;
      return this.parseReference(token.value);
    }
    return null;
  }

  private parseReference(object: string): Expr | null {
    const path: RefSegment[] = [];
    if (!this.consumeType("dot")) {
      this.errorMessage = "reference needs a property";
      return null;
    }

    while (true) {
      const segmentToken = this.tokens[this.position];
      if (!segmentToken || segmentToken.type !== "ident") {
        this.errorMessage = "reference needs a property";
        return null;
      }
      this.position += 1;

      if (isPathFunctionName(segmentToken.value) && this.isType("lparen")) {
        if (path.length !== 0) {
          this.errorMessage = "path function must follow only its object";
          return null;
        }
        return this.parsePathFunction(object, segmentToken.value);
      }

      const segment: RefSegment = { name: segmentToken.value };
      if (this.consumeType("lbracket")) {
        const indexToken = this.tokens[this.position];
        if (indexToken?.type !== "num" || !Number.isInteger(indexToken.value) || indexToken.value < 0) {
          this.errorMessage = "reference index must be a non-negative integer";
          return null;
        }
        this.position += 1;
        if (!this.consumeType("rbracket")) {
          this.errorMessage = "expected closing reference index bracket";
          return null;
        }
        segment.index = indexToken.value;
      }
      path.push(segment);

      if (!this.consumeType("dot")) {
        break;
      }
    }

    return path.length > 0 ? { kind: "ref", object, path } : null;
  }

  private parsePathFunction(object: string, fn: "pathX" | "pathY" | "pathAngle"): Expr | null {
    if (!this.consumeType("lparen")) {
      return null;
    }
    const pathNameToken = this.tokens[this.position];
    if (pathNameToken?.type !== "ident") {
      this.errorMessage = "path function expects a path name";
      return null;
    }
    this.position += 1;
    if (!this.consumeType("comma")) {
      this.errorMessage = "path function expects a comma";
      return null;
    }

    let sign = 1;
    if (this.isOperator("-")) {
      sign = -1;
      this.position += 1;
    }
    const valueToken = this.tokens[this.position];
    if (valueToken?.type !== "num") {
      this.errorMessage = "path function expects a numeric parameter";
      return null;
    }
    this.position += 1;
    if (!this.consumeType("rparen")) {
      this.errorMessage = "path function expects a closing parenthesis";
      return null;
    }

    return { kind: "pathFn", object, fn, pathName: pathNameToken.value, t: sign * valueToken.value };
  }

  private isOperator(operator: BinaryOp): boolean {
    const token = this.tokens[this.position];
    return token?.type === "op" && token.value === operator;
  }

  private isType(type: Token["type"]): boolean {
    return this.tokens[this.position]?.type === type;
  }

  private consumeType(type: Token["type"]): boolean {
    if (!this.isType(type)) {
      return false;
    }
    this.position += 1;
    return true;
  }

  private consumeOperator(): BinaryOp {
    const token = this.tokens[this.position];
    if (!token || token.type !== "op") {
      throw new Error("Presk internal: expected operator token");
    }
    this.position += 1;
    return token.value;
  }
}

function isPathFunctionName(name: string): name is "pathX" | "pathY" | "pathAngle" {
  return name === "pathX" || name === "pathY" || name === "pathAngle";
}

export function parseExpression(source: string): ParseResult {
  const tokenization = tokenize(source);
  if (!tokenization.ok) {
    return { ok: false, message: tokenization.message };
  }

  const parser = new ArithmeticParser(tokenization.tokens);
  const expr = parser.parse();
  return expr ? { ok: true, expr } : { ok: false, message: parser.message };
}
