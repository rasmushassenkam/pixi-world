import { Application, Container, Sprite } from "pixi.js";
import { generateGround, GroundSettings } from "../ground/ground";
import { enablePanning } from "../utils/enable-panning";
import { CanvasMinimap } from "../utils/canvas-minimap";

const TILE_SIZE = 16;
const MAP_WIDTH = 600;
const MAP_HEIGHT = 400;

export class GameApp {
  private app: Application;
  private world: Container = new Container();
  private uiLayer: Container = new Container();
  private minimap: CanvasMinimap | null = null;
  private currentMinimapSource: HTMLCanvasElement | null = null;
  private currentMapSprite: Sprite | null = null;

  // State locks to prevent crashing if sliders are dragged too fast
  private isGenerating = false;
  private pendingSettings: GroundSettings | null = null;

  // Track last position to avoid redundant minimap updates
  private lastWorldPos = { x: 0, y: 0, scale: 1 };

  constructor(parent: HTMLElement) {
    this.app = new Application();

    this.app.init({ background: "#1099bb", resizeTo: window }).then(() => {
      parent.appendChild(this.app.canvas);

      this.app.stage.addChild(this.world);
      this.app.stage.addChild(this.uiLayer);

      enablePanning(
        this.app,
        this.world,
        MAP_WIDTH * TILE_SIZE,
        MAP_HEIGHT * TILE_SIZE,
      );

      this.app.ticker.add(() => {
        if (!this.minimap) return;

        // Check if the world has actually moved or scaled/zoomed
        const hasMoved =
          this.world.x !== this.lastWorldPos.x ||
          this.world.y !== this.lastWorldPos.y ||
          this.world.scale.x !== this.lastWorldPos.scale;

        if (hasMoved) {
          this.minimap.update(
            this.world,
            this.app.screen.width,
            this.app.screen.height,
          );

          // Update cache
          this.lastWorldPos.x = this.world.x;
          this.lastWorldPos.y = this.world.y;
          this.lastWorldPos.scale = this.world.scale.x;
        }
      });
    });
  }

  public attachMinimap(canvas: HTMLCanvasElement) {
    this.minimap = new CanvasMinimap(canvas, TILE_SIZE);
    if (this.currentMinimapSource) {
      this.minimap.setMapImage(this.currentMinimapSource);
      this.minimap.update(
        this.world,
        this.app.screen.width,
        this.app.screen.height,
      );
    }
  }

  public async updateSettings(settings: GroundSettings) {
    if (this.isGenerating) {
      this.pendingSettings = settings;
      return;
    }
    this.isGenerating = true;

    const { container, minimapCanvas } = await generateGround(
      MAP_WIDTH,
      MAP_HEIGHT,
      settings,
    );

    if (this.currentMapSprite) {
      this.world.removeChild(this.currentMapSprite);
      this.currentMapSprite.destroy({ texture: true });
    }

    // Convert map sprites into single texture
    const texture = this.app.renderer.generateTexture({
      target: container,
      resolution: 1,
      antialias: false,
    });

    // Create ONE sprite to hold the whole map
    this.currentMapSprite = new Sprite(texture);
    this.world.addChild(this.currentMapSprite);

    // Cleanup
    container.destroy({ children: true });

    this.currentMinimapSource = minimapCanvas;
    if (this.minimap) {
      this.minimap.setMapImage(minimapCanvas);
      this.minimap.update(
        this.world,
        this.app.screen.width,
        this.app.screen.height,
      );
    }

    this.isGenerating = false;

    if (this.pendingSettings) {
      const next = this.pendingSettings;
      this.pendingSettings = null;
      this.updateSettings(next);
    }
  }

  public teleportTo(relativeX: number, relativeY: number) {
    const targetX = relativeX * (MAP_WIDTH * TILE_SIZE);
    const targetY = relativeY * (MAP_HEIGHT * TILE_SIZE);

    let newX = this.app.screen.width / 2 - targetX;
    let newY = this.app.screen.height / 2 - targetY;

    const minX = this.app.screen.width - MAP_WIDTH * TILE_SIZE;
    const minY = this.app.screen.height - MAP_HEIGHT * TILE_SIZE;

    newX = Math.max(minX, Math.min(0, newX));
    newY = Math.max(minY, Math.min(0, newY));

    this.world.position.set(newX, newY);
  }

  public destroy() {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
