import type KObject from "@/primitives/kobjet";

export interface KGraphicObjectParams {
    object: KObject;
}

class KGraphicObject {
    /* this is a temporary implementation real implemenation wont use DOM at all*/
    _object: KObject;
    constructor({ object }: KGraphicObjectParams) {
        this._object = object
    }
}

export default KGraphicObject;