import type KScene from "@/primitives/kscene";
import { Application, Graphics, type Renderer } from "pixi.js";

export interface KRendererParams {
    root: string,
    scene: KScene,
}

class KRenderer {
    private _app: Application<Renderer>;
    private _scene: KScene;
    private _rootElement: Element

    constructor({ scene, root }: KRendererParams) {
        this._app = new Application();
        this._scene = scene;
        const rootElement = document.querySelector(root);
        if (!rootElement) {
            throw `You must define root element : ${root}`;
        }
        this._rootElement = rootElement;
    }
    async init() {
        await this._app.init({
            width: this._scene.width,
            height: this._scene.height
        });

        this._rootElement.appendChild(this._app.canvas);
    }

    add(graphic: Graphics) {
        this._app.stage.addChild(graphic);
    }
}

export default KRenderer;