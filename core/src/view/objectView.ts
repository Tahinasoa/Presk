import { Container, Matrix } from "pixi.js";
import type { Mat } from "@/geom/matrix";
import type { PixiHost } from "@/view/pixiHost";
import type { SceneObject } from "@/model/sceneObject";

export abstract class ObjectView {
  readonly object: SceneObject;
  readonly host: PixiHost;
  readonly container: Container;

  constructor(object: SceneObject, host: PixiHost) {
    this.object = object;
    this.host = host;
    this.container = new Container();
  }

  update(): void {
    this.applyCommon();
    this.draw();
  }

  destroy(): void {
    this.host.remove(this.container);
    this.container.destroy({ children: true });
  }

  protected applyCommon(): void {
    const alpha = this.object.effectiveAlpha();
    this.container.visible = alpha > 0;
    this.container.alpha = alpha;
    this.container.setFromMatrix(toPixiMatrix(this.object.worldMatrix()));
  }

  protected abstract draw(): void;
}

export function toPixiMatrix(matrix: Mat): Matrix {
  return new Matrix(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
}
