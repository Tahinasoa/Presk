// Demo entry point: wires Presk up and plays compiler/input2.json.
// This is the reference example for how the pieces documented in
// src/README.md fit together in practice.
import "./style.css";
import Presk from "./presk";
import { registerBuiltins } from "./registry/builtins";
import { compile } from "./compiler/compiler";
import type { DslDocument } from "./compiler/types";
import inputData from "./compiler/input.json";

const doc = inputData as DslDocument;

const presk = new Presk();
registerBuiltins(presk);

await presk.init({
  root: "#app",
  width: doc.scene.width,
  height: doc.scene.height,
  background: doc.scene.background,
});

const timeline = compile(doc, presk);

presk.start(); // starts the single shared ticker (state -> bindings -> redraw)
timeline.play();
