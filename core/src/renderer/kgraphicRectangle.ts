import { Graphics } from "pixi.js";
import KGraphicObject, { type KGraphicObjectParams } from "./kgraphicObject";

class KGraphicRectangle extends KGraphicObject {
    private _rectangle: Graphics;

    constructor(params: KGraphicObjectParams&{width : number, height:number}) {
        super(params);
        this._rectangle = new Graphics();
        this._rectangle
            .rect(params.object.x, params.object.y, params.width, params.height)
            .fill(0xff0000);

        params.renderer.add(this._rectangle) ;
    }
    override update(): void {
        this._rectangle.x = this._object.x ;
        this._rectangle.y = this._object.y ;
    }

}


export default KGraphicRectangle;