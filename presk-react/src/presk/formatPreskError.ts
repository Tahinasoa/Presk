import { PreskCompileError } from "@presk/core";

export interface PreskErrorInfo {
  title: string;
  message: string;
}

export function formatPreskError(err: unknown): PreskErrorInfo {
  if (err instanceof PreskCompileError) {
    return {
      title: "Compilation Error",
      message: err.diagnostics
        .map(({ code, message }) => `${code}: ${message}`)
        .join("\n"),
    };
  }
  if (err instanceof Error) {
    return { title: "Error", message: err.message };
  }
  return { title: "Error", message: String(err) };
}
