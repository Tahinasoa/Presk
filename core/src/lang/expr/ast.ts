export type BinaryOp = "+" | "-" | "*" | "/";

export interface RefSegment {
  name: string;
  index?: number;
}

export type Expr =
  | { kind: "num"; value: number }
  | { kind: "neg"; operand: Expr }
  | { kind: "bin"; op: BinaryOp; left: Expr; right: Expr }
  | { kind: "ref"; object: string; path: RefSegment[] }
  | { kind: "pathFn"; object: string; fn: "pathX" | "pathY" | "pathAngle"; pathName: string; t: number };
