import KObject, { type KObjectParams } from "./kobject";

export interface KLineParams extends KObjectParams {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

class KLine extends KObject {
  override readonly type: string = "KLine";

  private _startX: number;
  private _startY: number;
  private _endX: number;
  private _endY: number;

  constructor({ startX, startY, endX, endY, ...rest }: KLineParams) {
    super(rest);
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
  }

  get startX(): number {
    return this._startX;
  }

  set startX(value: number) {
    this._startX = value;
  }

  get startY(): number {
    return this._startY;
  }

  set startY(value: number) {
    this._startY = value;
  }

  get endX(): number {
    return this._endX;
  }

  set endX(value: number) {
    this._endX = value;
  }

  get endY(): number {
    return this._endY;
  }

  set endY(value: number) {
    this._endY = value;
  }
}

export default KLine;
