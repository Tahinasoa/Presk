import type { BinaryOp, Expr } from "./ast";
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
      this.errorMessage = "references not supported yet";
    }
    return null;
  }

  private isOperator(operator: BinaryOp): boolean {
    const token = this.tokens[this.position];
    return token?.type === "op" && token.value === operator;
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

export function parseExpression(source: string): ParseResult {
  const tokenization = tokenize(source);
  if (!tokenization.ok) {
    return { ok: false, message: tokenization.message };
  }

  const parser = new ArithmeticParser(tokenization.tokens);
  const expr = parser.parse();
  return expr ? { ok: true, expr } : { ok: false, message: parser.message };
}
