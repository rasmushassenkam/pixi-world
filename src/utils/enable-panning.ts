import { Application, Container } from "pixi.js";

export const enablePanning = (app: Application, target: Container) => {
  // Enable events on the stage so we can click anywhere
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let targetStartX = 0;
  let targetStartY = 0;

  app.stage.on("pointerdown", (e) => {
    isDragging = true;
    // Record initial mouse position
    startX = e.global.x;
    startY = e.global.y;
    // Record initial container position
    targetStartX = target.x;
    targetStartY = target.y;

    app.canvas.style.cursor = "grabbing";
  });

  app.stage.on("pointermove", (e) => {
    if (!isDragging) return;

    const dx = e.global.x - startX;
    const dy = e.global.y - startY;

    // Apply the offset to the target container
    target.x = targetStartX + dx;
    target.y = targetStartY + dy;
  });

  const onDragEnd = () => {
    isDragging = false;
    app.canvas.style.cursor = "default";
  };

  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);
};
