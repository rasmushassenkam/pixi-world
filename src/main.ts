import { Application, Container, Sprite, Graphics } from "pixi.js";
import { generateGround } from "./ground/ground";
import { createControls } from "./create-controls";
import { enablePanning } from "./utils/enable-panning";

const TILE_SIZE = 16;
const MAP_WIDTH_TILES = 300;
const MAP_HEIGHT_TILES = 240;

const settings = {
  scale: 20,
  octaves: 3,
  persistence: 0.5,
  exponent: 1.0,
  seed: "my-seed",
};

(async () => {
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });

  const container = document.getElementById("pixi-container")!;
  container.appendChild(app.canvas);

  const worldContainer = new Container();
  app.stage.addChild(worldContainer);

  const uiContainer = new Container();
  app.stage.addChild(uiContainer);

  let currentGround: Container | null = null;
  let minimapSprite: Sprite | null = null;
  let viewportRect: Graphics | null = null; // The red box on minimap

  let isGenerating = false;
  let pendingUpdate = false;

  const updateMap = async () => {
    if (isGenerating) {
      pendingUpdate = true;
      return;
    }
    isGenerating = true;

    const { container: newGround, minimapTexture } = await generateGround(
      MAP_WIDTH_TILES,
      MAP_HEIGHT_TILES,
      settings,
    );

    if (currentGround) {
      worldContainer.removeChild(currentGround);
      currentGround.destroy({ children: true });
    }
    currentGround = newGround;
    worldContainer.addChild(currentGround);

    if (!minimapSprite) {
      minimapSprite = new Sprite();
      minimapSprite.x = app.screen.width - MAP_WIDTH_TILES - 20;
      minimapSprite.y = app.screen.height - MAP_HEIGHT_TILES - 20;

      const border = new Graphics();
      border.rect(0, 0, MAP_WIDTH_TILES, MAP_HEIGHT_TILES);
      border.stroke({ width: 2, color: 0xffffff });
      minimapSprite.addChild(border);

      viewportRect = new Graphics();
      minimapSprite.addChild(viewportRect);

      uiContainer.addChild(minimapSprite);
    }

    minimapSprite.texture = minimapTexture;

    isGenerating = false;
    if (pendingUpdate) {
      pendingUpdate = false;
      updateMap();
    }
  };

  await updateMap();

  const totalMapWidth = MAP_WIDTH_TILES * TILE_SIZE;
  const totalMapHeight = MAP_HEIGHT_TILES * TILE_SIZE;
  enablePanning(app, worldContainer, totalMapWidth, totalMapHeight);
  createControls(container, settings, updateMap);

  app.ticker.add(() => {
    if (!minimapSprite || !viewportRect) return;

    // Calculate Ratio (Minimap Size / Real World Size)
    const ratio = 1 / TILE_SIZE;

    // Calculate Position
    const rectX = -worldContainer.x * ratio;
    const rectY = -worldContainer.y * ratio;

    // Calculate Size
    const rectW = app.screen.width * ratio;
    const rectH = app.screen.height * ratio;

    viewportRect.clear();
    viewportRect.rect(rectX, rectY, rectW, rectH);
    viewportRect.stroke({ width: 1, color: 0xff0000 }); // Red line
  });
})();
