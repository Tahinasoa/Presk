// Vite dev/build configuration for the Presk core package.
// Resolves the "@/*" path alias (declared in tsconfig.json) so source files
// can import each other with e.g. `import KScene from "@/primitives/kscene"`
// instead of long relative paths like `../../primitives/kscene`.
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: false,
  },
});
