import { Application, Container } from "pixi.js";
import { generateGround } from "./ground/ground";
import { createControls } from "./create-controls";
import { enablePanning } from "./utils/enable-panning";
import { createMinimap } from "./utils/create-minimap";

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
  const uiContainer = new Container();

  app.stage.addChild(worldContainer);
  app.stage.addChild(uiContainer);

  const minimap = createMinimap(
    app,
    uiContainer,
    MAP_WIDTH_TILES,
    MAP_HEIGHT_TILES,
    TILE_SIZE,
  );

  let currentGround: Container | null = null;
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

    minimap.updateTexture(minimapTexture);

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
    minimap.updateViewport(worldContainer);
  });
})();
