import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  publicDir : false,
  build: {
    lib: {
      entry: "src/index.ts",
      name: "presk",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rolldownOptions: {
      external: [/^pixi\.js(\/.*)?$/],
      output: {
        globals: { "pixi.js": "PIXI" },
      },
    },
  },
});