// KRenderer owns the PixiJS Application: the actual <canvas> element and
// its DOM container. It is intentionally "dumb" — it doesn't know about
// KObject/KScene at all, only about attaching/detaching PixiJS display
// objects to the stage. KGraphicObjects call add()/remove() on it.

import { Application, type Container, type Renderer } from "pixi.js";

export interface KRendererParams {
  /** CSS selector for the element the <canvas> gets appended into. */
  root: string;
  width: number;
  height: number;
  background?: string;
}

class KRenderer {
  private _app: Application<Renderer>;
  private _rootElement: Element;
  private _width: number;
  private _height: number;
  private _background: string;

  constructor({ root, width, height, background = "#101014" }: KRendererParams) {
    this._app = new Application();
    const rootElement = document.querySelector(root);
    if (!rootElement) {
      throw new Error(`KRenderer: root element not found for selector "${root}".`);
    }
    this._rootElement = rootElement;
    this._width = width;
    this._height = height;
    this._background = background;
  }

  async init(): Promise<void> {
    await this._app.init({
      width: this._width,
      height: this._height,
      background: this._background,
      antialias: true,
    });

    this._rootElement.appendChild(this._app.canvas);
  }

  add(displayObject: Container): void {
    this._app.stage.addChild(displayObject);
  }

  remove(displayObject: Container): void {
    this._app.stage.removeChild(displayObject);
  }
}

export default KRenderer;
