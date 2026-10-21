import { Application, Container } from "pixi.js";

export class PixiHost {
  private readonly root: Element;
  private instance: Application | null = null;
  private worldContainer: Container | null = null;

  constructor(rootSelector: string) {
    const root = document.querySelector(rootSelector);
    if (!root) throw new Error(`PixiHost: root element not found for selector "${rootSelector}".`);
    this.root = root;
  }

  async init(width: number, height: number, background?: string): Promise<void> {
    const app = new Application();
    await app.init({
      width,
      height,
      background: background ?? "#000000",
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.root.appendChild(app.canvas);
    const world = new Container();
    app.stage.addChild(world);
    this.instance = app;
    this.worldContainer = world;
  }

  get app(): Application {
    if (!this.instance) throw new Error("PixiHost: application has not been initialized.");
    return this.instance;
  }

  get world(): Container {
    if (!this.worldContainer) throw new Error("PixiHost: world container has not been initialized.");
    return this.worldContainer;
  }

  resize(width: number, height: number, background?: string): void {
    this.app.renderer.resize(width, height);
    this.app.renderer.background.color = background ?? "#000000";
  }

  add(container: Container): void {
    this.world.addChild(container);
  }

  remove(container: Container): void {
    this.world.removeChild(container);
  }

  setViewport(cx: number, cy: number, zoom: number, sceneWidth: number, sceneHeight: number): void {
    this.world.scale.set(zoom);
    this.world.position.set(sceneWidth / 2 - cx * zoom, sceneHeight / 2 - cy * zoom);
  }

  destroy(): void {
    if (!this.instance) return;
    this.instance.destroy(true, { children: true });
    this.instance = null;
    this.worldContainer = null;
  }
}
