import KObject, { type KObjectParams } from "./kobjet";

export interface KRectangleParams extends KObjectParams {
    width: number;
    height: number;
    anchorX?: number; // 0 = gauche, 0.5 = centre, 1 = droite
    anchorY?: number; // 0 = haut, 0.5 = centre, 1 = bas
}

export interface KPoint {
    x: number;
    y: number;
}

class KRectangle extends KObject {
    readonly type: string = "KRectangle";

    private _width: number;
    private _height: number;
    private _anchorX: number;
    private _anchorY: number;

    constructor({ width, height, anchorX = 0.5, anchorY = 0.5, ...rest }: KRectangleParams) {
        super(rest);
        this._width = width;
        this._height = height;
        this._anchorX = anchorX;
        this._anchorY = anchorY;
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

    get anchorX(): number {
        return this._anchorX;
    }

    set anchorX(value: number) {
        this._anchorX = value;
    }

    get anchorY(): number {
        return this._anchorY;
    }

    set anchorY(value: number) {
        this._anchorY = value;
    }

    // ---- Centre géométrique et rotation ----

    /**
     * Décalage entre le point (x, y) de l'objet et son centre géométrique,
     * selon l'ancre, avant scale/rotation.
     */
    private get pivotOffsetX(): number {
        return (0.5 - this._anchorX) * this._width;
    }

    private get pivotOffsetY(): number {
        return (0.5 - this._anchorY) * this._height;
    }

    /**
     * Centre réel du rectangle en coordonnées scène (tient compte de
     * l'ancre, du scale et de la rotation). C'est aussi le pivot autour
     * duquel la rotation s'applique.
     */
    get center(): KPoint {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const ox = this.pivotOffsetX * this.scale;
        const oy = this.pivotOffsetY * this.scale;

        return {
            x: this.x + ox * cos - oy * sin,
            y: this.y + ox * sin + oy * cos,
        };
    }

    /**
     * Coin donné en unités locales non tournées (ex: -0.5/-0.5 = topLeft),
     * projeté en coordonnées scène après scale + rotation autour du centre.
     */
    private getCorner(localX: number, localY: number): KPoint {
        const center = this.center;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        const dx = localX * this._width * this.scale;
        const dy = localY * this._height * this.scale;

        return {
            x: center.x + dx * cos - dy * sin,
            y: center.y + dx * sin + dy * cos,
        };
    }

    // ---- Coins réels (§4.2 — suivent la rotation) ----

    get topLeft(): KPoint {
        return this.getCorner(-0.5, -0.5);
    }

    get topRight(): KPoint {
        return this.getCorner(0.5, -0.5);
    }

    get bottomRight(): KPoint {
        return this.getCorner(0.5, 0.5);
    }

    get bottomLeft(): KPoint {
        return this.getCorner(-0.5, 0.5);
    }

    get corners(): KPoint[] {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
    }

    // ---- Bounding box axis-aligned (§4.3 — boundingBox.*) ----

    get boxLeft(): number {
        return Math.min(...this.corners.map((p) => p.x));
    }

    get boxRight(): number {
        return Math.max(...this.corners.map((p) => p.x));
    }

    get boxTop(): number {
        return Math.min(...this.corners.map((p) => p.y));
    }

    get boxBottom(): number {
        return Math.max(...this.corners.map((p) => p.y));
    }

    get boxWidth(): number {
        return this.boxRight - this.boxLeft;
    }

    get boxHeight(): number {
        return this.boxBottom - this.boxTop;
    }

    get boxTopLeft(): KPoint {
        return { x: this.boxLeft, y: this.boxTop };
    }

    get boxTopRight(): KPoint {
        return { x: this.boxRight, y: this.boxTop };
    }

    get boxBottomLeft(): KPoint {
        return { x: this.boxLeft, y: this.boxBottom };
    }

    get boxBottomRight(): KPoint {
        return { x: this.boxRight, y: this.boxBottom };
    }

    get boxCenter(): KPoint {
        return { x: (this.boxLeft + this.boxRight) / 2, y: (this.boxTop + this.boxBottom) / 2 };
    }

    // ---- Tests géométriques ----

    /**
     * Collision AABB rapide sur les bounding box (approximative si les deux
     * rectangles sont tournés — utiliser une méthode SAT pour un test exact).
     */
    intersectsBox(other: KRectangle): boolean {
        return (
            this.boxLeft < other.boxRight &&
            this.boxRight > other.boxLeft &&
            this.boxTop < other.boxBottom &&
            this.boxBottom > other.boxTop
        );
    }

    /**
     * Test si un point est dans le bounding box (rapide, imprécis si tourné).
     */
    containsPointBox(px: number, py: number): boolean {
        return px >= this.boxLeft && px <= this.boxRight && py >= this.boxTop && py <= this.boxBottom;
    }

    /**
     * Test précis (tient compte de la rotation) : on ramène le point dans le
     * repère local du rectangle (non tourné), puis on teste comme une AABB
     * centrée sur l'origine.
     */
    containsPoint(px: number, py: number): boolean {
        const center = this.center;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);

        const dx = px - center.x;
        const dy = py - center.y;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const halfW = (this._width * this.scale) / 2;
        const halfH = (this._height * this.scale) / 2;

        return localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH;
    }
}

export default KRectangle;