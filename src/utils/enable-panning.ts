import { Application, Container } from "pixi.js";

export const enablePanning = (
  app: Application,
  target: Container,
  mapWidth: number,
  mapHeight: number,
) => {
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let targetStartX = 0;
  let targetStartY = 0;

  app.stage.on("pointerdown", (e) => {
    isDragging = true;
    startX = e.global.x;
    startY = e.global.y;
    targetStartX = target.x;
    targetStartY = target.y;

    app.canvas.style.cursor = "grabbing";
  });

  app.stage.on("pointermove", (e) => {
    if (!isDragging) return;

    const dx = e.global.x - startX;
    const dy = e.global.y - startY;

    let newX = targetStartX + dx;
    let newY = targetStartY + dy;

    const screenW = app.screen.width;
    const screenH = app.screen.height;

    // Horizontal Bounds
    if (mapWidth > screenW) {
      // If map is wider than screen, allow panning between:
      // Right limit: 0 (Left edge of map touches left edge of screen)
      // Left limit: screenW - mapWidth (Right edge of map touches right edge of screen)
      const minX = screenW - mapWidth;
      const maxX = 0;
      newX = Math.max(minX, Math.min(newX, maxX));
    } else {
      // If map is smaller than screen, lock to left
      newX = 0;
    }

    // Vertical Bounds
    if (mapHeight > screenH) {
      const minY = screenH - mapHeight;
      const maxY = 0;
      newY = Math.max(minY, Math.min(newY, maxY));
    } else {
      newY = 0;
    }

    target.x = newX;
    target.y = newY;
  });

  const onDragEnd = () => {
    isDragging = false;
    app.canvas.style.cursor = "default";
  };

  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);
};
