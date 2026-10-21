export type Token =
  | { type: "num"; value: number; pos: number }
  | { type: "ident"; value: string; pos: number }
  | { type: "op"; value: "+" | "-" | "*" | "/"; pos: number }
  | { type: "dot" | "lbracket" | "rbracket" | "lparen" | "rparen" | "comma"; pos: number };

export type TokenizeResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; message: string; pos: number };

function isDigit(character: string): boolean {
  return character >= "0" && character <= "9";
}

function isIdentifierStart(character: string): boolean {
  return (character >= "A" && character <= "Z")
    || (character >= "a" && character <= "z")
    || character === "_";
}

function isIdentifierPart(character: string): boolean {
  return isIdentifierStart(character) || isDigit(character);
}

export function tokenize(source: string): TokenizeResult {
  const tokens: Token[] = [];
  let position = 0;

  while (position < source.length) {
    const character = source[position];

    if (character === " " || character === "\t" || character === "\n" || character === "\r") {
      position += 1;
      continue;
    }

    if (isDigit(character)) {
      const start = position;
      while (position < source.length && isDigit(source[position])) {
        position += 1;
      }
      if (source[position] === "." && isDigit(source[position + 1] ?? "")) {
        position += 1;
        while (position < source.length && isDigit(source[position])) {
          position += 1;
        }
      }
      tokens.push({ type: "num", value: Number(source.slice(start, position)), pos: start });
      continue;
    }

    if (isIdentifierStart(character)) {
      const start = position;
      position += 1;
      while (position < source.length && isIdentifierPart(source[position])) {
        position += 1;
      }
      tokens.push({ type: "ident", value: source.slice(start, position), pos: start });
      continue;
    }

    if (character === "+" || character === "-" || character === "*" || character === "/") {
      tokens.push({ type: "op", value: character, pos: position });
      position += 1;
      continue;
    }

    const punctuation = {
      ".": "dot",
      "[": "lbracket",
      "]": "rbracket",
      "(": "lparen",
      ")": "rparen",
      ",": "comma",
    } as const;
    const punctuationType = punctuation[character as keyof typeof punctuation];
    if (punctuationType) {
      tokens.push({ type: punctuationType, pos: position });
      position += 1;
      continue;
    }

    return {
      ok: false,
      message: `unexpected character '${character}' at ${position}`,
      pos: position,
    };
  }

  return { ok: true, tokens };
}
