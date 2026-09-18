export interface KObjectParams{
    id : string ;
    x : number;
    y:number;
    scale?:number
    rotation?:number
}

class KObject {
    readonly type:string = "KObject" ;
    private _id : string ;
    private _x : number ;
    private _y : number ;
    private _scale : number ;
    private _rotation : number;

    constructor({id, x, y, scale=1, rotation=0}:KObjectParams){
        this._id = id ;
        this._x = x ;
        this._y = y ;
        this._scale = scale || 1 ;
        this._rotation  = rotation || 0 ;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
    }

    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        this._rotation = value;
    }
}

export default KObject ;