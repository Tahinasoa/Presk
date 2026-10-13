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

const timer = compile(doc, presk);
const playButton = document.querySelector<HTMLButtonElement>("#play-button");
const pauseButton = document.querySelector<HTMLButtonElement>("#pause-button");
const timelineCursor = document.querySelector<HTMLInputElement>("#timeline-cursor");
const timelineTime = document.querySelector<HTMLOutputElement>("#timeline-time");

if (!playButton || !pauseButton || !timelineCursor || !timelineTime) {
  throw new Error("Timeline controls are missing from index.html.");
}

const duration = timer.calculateDuration();
timelineCursor.max = String(duration || 1);
timelineCursor.disabled = duration === 0;
playButton.disabled = duration === 0;

function updateTimelineControls(): void {
  const time = Math.min(timer.currentProgress, duration);
  timelineCursor.value = String(time);
  timelineCursor.setAttribute("aria-valuetext", `${time.toFixed(2)} seconds`);
  timelineTime.value = `${time.toFixed(2)} / ${duration.toFixed(2)} s`;
}

playButton.addEventListener("click", () => {
  if (duration > 0 && timer.currentProgress >= duration) {
    timer.seek(0);
  }
  timer.play();
  updateTimelineControls();
});

pauseButton.addEventListener("click", () => {
  timer.pause();
  updateTimelineControls();
});

timelineCursor.addEventListener("input", () => {
  timer.pause();
  timer.seek(Number(timelineCursor.value));
});

timer.onUpdate(updateTimelineControls);
updateTimelineControls();
presk.start(); // starts KTimer (tweens -> bindings -> redraw)
