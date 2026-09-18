import type KObject from "@/primitives/kobjet";
import type KRenderer from "./krenderer";

export interface KGraphicObjectParams {
    renderer : KRenderer ;
    object: KObject;
}

class KGraphicObject {
    /* this is a temporary implementation real implemenation wont use DOM at all*/
    protected _object: KObject;
    constructor({ object}: KGraphicObjectParams) {
        this._object = object
    }
    update(){
        /* specific to each children */
    }
}

export default KGraphicObject;