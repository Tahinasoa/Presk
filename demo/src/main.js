import { Presk, PreskCompileError } from "@presk/core";
import sampleClip from "./example.presk.json";
async function main() {
    const presk = await Presk.create({ root: "#app" });
    try {
        await presk.load(sampleClip);
    }
    catch (error) {
        if (!(error instanceof PreskCompileError))
            throw error;
        const message = error.diagnostics.map(({ code, message: detail }) => `${code}: ${detail}`).join("\n");
        console.error(message);
        const output = document.createElement("pre");
        output.textContent = message;
        document.body.appendChild(output);
        return;
    }
    const playButton = document.getElementById("play-button");
    const pauseButton = document.getElementById("pause-button");
    const cursor = document.getElementById("timeline-cursor");
    const timeOutput = document.getElementById("timeline-time");
    if (!(playButton instanceof HTMLButtonElement)
        || !(pauseButton instanceof HTMLButtonElement)
        || !(cursor instanceof HTMLInputElement)
        || !(timeOutput instanceof HTMLOutputElement)) {
        throw new Error("Presk demo: one or more timeline controls are missing or have the wrong element type.");
    }
    cursor.max = String(presk.duration);
    cursor.addEventListener("input", () => {
        presk.pause();
        presk.renderAt(Number(cursor.value));
    });
    playButton.addEventListener("click", () => presk.play());
    pauseButton.addEventListener("click", () => presk.pause());
    presk.onFrame((time) => {
        cursor.value = String(time);
        timeOutput.textContent = `${time.toFixed(2)} / ${presk.duration.toFixed(2)} s`;
    });
}
void main();
