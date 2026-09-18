import KRenderer from "./renderer/krenderer";
import KScene from "./primitives/kscene";
import KGraphicRectangle from "./renderer/kgraphicRectangle";

const appRoot = document.querySelector("#app") ?? document.body;

if (!(appRoot instanceof HTMLElement)) {
    throw new Error("The app root is not a valid HTML element.");
}

const scene = new KScene({
    id: "main-scene",
    x: 0,
    y: 0,
    width: 800,
    height: 600,
});
const renderer = new KRenderer({
    root: "#app",
    scene,
});

await renderer.init();


const graphictRectangle = new KGraphicRectangle({
    renderer: renderer,
    object: scene,
    width: scene.width,
    height: scene.height,
});