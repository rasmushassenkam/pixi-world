import { Container } from "pixi.js";

export class CanvasMinimap {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private mapImage: HTMLCanvasElement | null = null;
  private tileSize: number;

  constructor(canvas: HTMLCanvasElement, tileSize: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.tileSize = tileSize;
    this.ctx.imageSmoothingEnabled = false;
  }

  public setMapImage(sourceCanvas: HTMLCanvasElement) {
    this.mapImage = sourceCanvas;
    this.canvas.width = sourceCanvas.width;
    this.canvas.height = sourceCanvas.height;
  }

  public update(
    world: Container,
    appScreenWidth: number,
    appScreenHeight: number,
  ) {
    if (!this.mapImage) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.mapImage, 0, 0);

    const ratio = 1 / this.tileSize;
    const worldScale = world.scale.x || 1;

    const rectW = (appScreenWidth / worldScale) * ratio;
    const rectH = (appScreenHeight / worldScale) * ratio;

    const rectX = (-world.x / worldScale) * ratio;
    const rectY = (-world.y / worldScale) * ratio;

    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(rectX, rectY, rectW, rectH);
  }
}
