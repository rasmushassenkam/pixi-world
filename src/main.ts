import { Application, Container } from "pixi.js";
import { generateGround } from "./ground/ground";
import { createControls } from "./create-controls";
import { enablePanning } from "./utils/enable-panning";

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

  let currentGround: Container | null = null;
  let isGenerating = false;
  let pendingUpdate = false;

  const updateMap = async () => {
    if (isGenerating) {
      pendingUpdate = true;
      return;
    }
    isGenerating = true;

    const newGround = await generateGround(300, 120, settings);

    if (currentGround) {
      worldContainer.removeChild(currentGround);
      currentGround.destroy({ children: true });
    }
    currentGround = newGround;
    worldContainer.addChild(currentGround);

    isGenerating = false;
    if (pendingUpdate) {
      pendingUpdate = false;
      updateMap();
    }
  };

  await updateMap();
  enablePanning(app, worldContainer);
  createControls(container, settings, updateMap);
})();
