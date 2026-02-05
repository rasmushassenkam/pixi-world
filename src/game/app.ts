import { Application, Container } from "pixi.js";
import { generateGround, GroundSettings } from "../ground/ground";
import { enablePanning } from "../utils/enable-panning";
import { CanvasMinimap } from "../utils/canvas-minimap";

const TILE_SIZE = 16;
const MAP_WIDTH = 480;
const MAP_HEIGHT = 300;

export class GameApp {
  private app: Application;
  private world: Container = new Container();
  private uiLayer: Container = new Container();
  private minimap: CanvasMinimap | null = null;
  private currentMinimapSource: HTMLCanvasElement | null = null;

  private currentGround: Container | null = null;

  // State locks to prevent crashing if sliders are dragged too fast
  private isGenerating = false;
  private pendingSettings: GroundSettings | null = null;

  constructor(parent: HTMLElement) {
    this.app = new Application();

    // Initialize Pixi
    this.app.init({ background: "#1099bb", resizeTo: window }).then(() => {
      parent.appendChild(this.app.canvas);

      // Layers
      this.app.stage.addChild(this.world);
      this.app.stage.addChild(this.uiLayer);

      // Tools
      enablePanning(
        this.app,
        this.world,
        MAP_WIDTH * TILE_SIZE,
        MAP_HEIGHT * TILE_SIZE,
      );

      this.app.ticker.add(() => {
        if (this.minimap) {
          this.minimap.update(
            this.world,
            this.app.screen.width,
            this.app.screen.height,
          );
        }
      });
    });
  }

  public attachMinimap(canvas: HTMLCanvasElement) {
    this.minimap = new CanvasMinimap(canvas, TILE_SIZE);
    if (this.currentMinimapSource) {
      this.minimap.setMapImage(this.currentMinimapSource);
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

    if (this.currentGround) {
      this.world.removeChild(this.currentGround);
      this.currentGround.destroy({ children: true });
    }
    this.currentGround = container;
    this.world.addChild(container);
    this.currentMinimapSource = minimapCanvas;

    if (this.minimap) {
      this.minimap.setMapImage(minimapCanvas);
    }

    this.isGenerating = false;

    if (this.pendingSettings) {
      const next = this.pendingSettings;
      this.pendingSettings = null;
      this.updateSettings(next);
    }
  }

  public destroy() {
    this.app.destroy({ removeView: true }, { children: true });
  }
}
