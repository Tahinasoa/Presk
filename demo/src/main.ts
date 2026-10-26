import { Presk, PreskCompileError } from "@presk/core";
import sampleClip from "../../core/src/app/primitives-examples/001-rectangle.presk.json";

async function main() {
  const presk = await Presk.create({ root: "#app" });
  try {
    await presk.load(sampleClip);
  } catch (error) {
    if (error instanceof PreskCompileError) {
      console.error(error.diagnostics);
    }
    throw error;
  }

  document.getElementById("play")?.addEventListener("click", () => presk.play());
  document.getElementById("pause")?.addEventListener("click", () => presk.pause());
}

void main();
