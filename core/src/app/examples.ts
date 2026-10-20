export const HELLO: unknown = {
  version: "1.0",
  scene: { width: 1280, height: 720, background: "#101014" },
  steps: [
    { action: "create", target: "title", type: "text", properties: { text: "Presk", fontSize: 64, color: "white", pos: { x: 100, y: 100 } } },
    { action: "create", target: "box", type: "rectangle", properties: { width: 200, height: 80, fill: "#3b82f6", topLeft: "title.bottomLeft" } },
    { action: "animate", target: "title", properties: { reveal: true } },
    { action: "animate", target: "box", properties: { reveal: true }, start: "<0.3" },
    { action: "animate", target: "box", properties: { x: 600 }, duration: 2, ease: "cubicInOut" },
  ],
};
