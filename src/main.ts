import { Application, Container } from "pixi.js";
import { generateGround } from "./ground/ground";
import { createControls } from "./create-controls";

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
  app.ticker.add(() => {});

  app.stage.eventMode = "static";

  app.stage.hitArea = app.screen;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let containerStartX = 0;
  let containerStartY = 0;

  app.stage.on("pointerdown", (e) => {
    isDragging = true;
    startX = e.global.x;
    startY = e.global.y;
    containerStartX = worldContainer.x;
    containerStartY = worldContainer.y;

    app.canvas.style.cursor = "grabbing";
  });

  app.stage.on("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.global.x - startX;
    const dy = e.global.y - startY;
    worldContainer.x = containerStartX + dx;
    worldContainer.y = containerStartY + dy;
  });

  const onDragEnd = () => {
    isDragging = false;
    app.canvas.style.cursor = "default";
  };

  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  createControls(container, settings, updateMap);
})();
