import { Graphics } from "pixi.js";
import { splitColor } from "@/geom/color";
import type { Pt } from "@/geom/vec";
import type { PixiHost } from "@/view/pixiHost";
import { ObjectView } from "@/view/objectView";
import type { ViewRegistry } from "@/view/viewRegistry";
import type { SceneObject } from "@/model/sceneObject";

export class PathStrokeView extends ObjectView {
  protected readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    this.graphics.clear();
    const path = this.object.def.paths.main.build(this.object);
    const drawProgress = this.object.hasState("drawProgress")
      ? this.object.getNumber("drawProgress")
      : 1;
    const points = drawProgress >= 1
      ? path.closed && path.points.length > 1
        ? [...path.points, path.points[0]]
        : path.points
      : path.sub(0, drawProgress);
    drawPolyline(this.graphics, points);
    const stroke = splitColor(this.object.getColor("stroke"));
    this.graphics.stroke({
      width: this.object.getNumber("strokeWidth"),
      color: stroke.rgb,
      alpha: stroke.alpha,
    });
  }
}

export class ArrowView extends PathStrokeView {
  protected draw(): void {
    super.draw();
    if (
      this.object.hasState("drawProgress") &&
      this.object.getNumber("drawProgress") < 1
    ) {
      return;
    }

    const path = this.object.def.paths.main.build(this.object);
    const points = path.points;
    const head = this.object.getString("head");
    const stroke = splitColor(this.object.getColor("stroke"));
    const strokeWidth = this.object.getNumber("strokeWidth");
    const length = Math.max(10, 4 * strokeWidth);
    if (head === "start" || head === "both") {
      drawArrowHead(this.graphics, points, true, length, stroke);
    }
    if (head === "end" || head === "both") {
      drawArrowHead(this.graphics, points, false, length, stroke);
    }
  }
}

export class RayView extends ObjectView {
  private readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    this.graphics.clear();
    const p0 = this.object.getPoint("p0");
    const p1 = this.object.getPoint("p1");
    const deltaX = p1.x - p0.x;
    const deltaY = p1.y - p0.y;
    const length = Math.hypot(deltaX, deltaY);
    if (length === 0) return;

    const end = {
      x: p0.x + (deltaX / length) * 10000,
      y: p0.y + (deltaY / length) * 10000,
    };
    this.graphics.moveTo(p0.x, p0.y).lineTo(end.x, end.y);
    const stroke = splitColor(this.object.getColor("stroke"));
    this.graphics.stroke({
      width: this.object.getNumber("strokeWidth"),
      color: stroke.rgb,
      alpha: stroke.alpha,
    });
  }
}

export class LineView extends ObjectView {
  private readonly graphics: Graphics;

  constructor(object: SceneObject, host: PixiHost) {
    super(object, host);
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.host.add(this.container);
  }

  protected draw(): void {
    this.graphics.clear();
    const p0 = this.object.getPoint("p0");
    const p1 = this.object.getPoint("p1");
    const deltaX = p1.x - p0.x;
    const deltaY = p1.y - p0.y;
    const length = Math.hypot(deltaX, deltaY);
    if (length === 0) return;

    const unitX = deltaX / length;
    const unitY = deltaY / length;
    this.graphics
      .moveTo(p0.x - unitX * 10000, p0.y - unitY * 10000)
      .lineTo(p0.x + unitX * 10000, p0.y + unitY * 10000);
    const stroke = splitColor(this.object.getColor("stroke"));
    this.graphics.stroke({
      width: this.object.getNumber("strokeWidth"),
      color: stroke.rgb,
      alpha: stroke.alpha,
    });
  }
}

function drawPolyline(graphics: Graphics, points: readonly Pt[]): void {
  const first = points[0];
  if (!first) return;
  graphics.moveTo(first.x, first.y);
  for (const point of points.slice(1)) {
    graphics.lineTo(point.x, point.y);
  }
}

function drawArrowHead(
  graphics: Graphics,
  points: readonly Pt[],
  atStart: boolean,
  length: number,
  color: { rgb: number; alpha: number },
): void {
  const tip = atStart ? points[0] : points[points.length - 1];
  if (!tip) return;

  const anchorIndex = atStart ? 1 : points.length - 2;
  const step = atStart ? 1 : -1;
  let anchor: Pt | undefined;
  for (
    let index = anchorIndex;
    index >= 0 && index < points.length;
    index += step
  ) {
    const candidate = points[index];
    if (candidate.x !== tip.x || candidate.y !== tip.y) {
      anchor = candidate;
      break;
    }
  }
  if (!anchor) return;

  const deltaX = atStart ? anchor.x - tip.x : tip.x - anchor.x;
  const deltaY = atStart ? anchor.y - tip.y : tip.y - anchor.y;
  const magnitude = Math.hypot(deltaX, deltaY);
  if (magnitude === 0) return;

  const unitX = deltaX / magnitude;
  const unitY = deltaY / magnitude;
  const baseX = tip.x - unitX * length;
  const baseY = tip.y - unitY * length;
  const halfWidth = length / 2;
  const perpendicularX = -unitY * halfWidth;
  const perpendicularY = unitX * halfWidth;

  graphics
    .moveTo(tip.x, tip.y)
    .lineTo(baseX + perpendicularX, baseY + perpendicularY)
    .lineTo(baseX - perpendicularX, baseY - perpendicularY)
    .closePath()
    .fill({ color: color.rgb, alpha: color.alpha });
}

function registerPathView(
  registry: ViewRegistry,
  type: string,
  view: new (object: SceneObject, host: PixiHost) => ObjectView,
): void {
  registry.register(type, (object, host) => new view(object, host));
}

export function registerPathViews(registry: ViewRegistry): void {
  registerPathView(registry, "segment", PathStrokeView);
  registerPathView(registry, "polyline", PathStrokeView);
  registerPathView(registry, "arc", PathStrokeView);
  registerPathView(registry, "curve", PathStrokeView);
  registerPathView(registry, "arrow", ArrowView);
  registerPathView(registry, "ray", RayView);
  registerPathView(registry, "line", LineView);
}
