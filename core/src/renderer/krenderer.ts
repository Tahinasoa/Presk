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

    draw() {
        const square = new Graphics();

        square
            .rect(0, 0, 100, 100)
            .fill('#3498db');

        square.x = 350;
        square.y = 250;

        this._app.stage.addChild(square);
    }

}


export default KRenderer;