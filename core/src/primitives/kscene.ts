import KObject, { type KObjectParams } from "./kobjet";

export interface KSceneParams extends KObjectParams {
    width: number;
    height: number;
}


class KScene extends KObject {
    override readonly type: string = "KScene";
    private _width: number;
    private _height: number;

    constructor(params: KSceneParams) {
        super(params);
        this._width = params.width;
        this._height = params.height;
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
    }
}


export default KScene;