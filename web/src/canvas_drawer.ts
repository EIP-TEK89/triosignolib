import { Point2D } from "triosigno-lib-core"

export class CanvasDrawer {
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    drawPoint(point: Point2D, d: number): void {
        this.ctx.beginPath();
        this.ctx.fillStyle = "red";
        this.ctx.arc((point[0] + 0.5) * this.ctx.canvas.width, (point[1] + 0.5) * this.ctx.canvas.height, 5, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawLine(p1: Point2D, d1: number, p2: Point2D, d2: number): void {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "blue";
        this.ctx.moveTo((p1[0] + 0.5) * this.ctx.canvas.width, (p1[1] + 0.5) * this.ctx.canvas.height);
        this.ctx.lineTo((p2[0] + 0.5) * this.ctx.canvas.width, (p2[1] + 0.5) * this.ctx.canvas.height);
        this.ctx.stroke();
    }
}
