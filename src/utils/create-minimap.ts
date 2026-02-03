import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";

export const createMinimap = (
  app: Application,
  parent: Container,
  width: number,
  height: number,
  tileSize: number,
) => {
  const sprite = new Sprite();

  sprite.x = app.screen.width - width - 20;
  sprite.y = app.screen.height - height - 20;

  const border = new Graphics();
  border.rect(0, 0, width, height);
  border.stroke({ width: 2, color: 0xffffff });
  sprite.addChild(border);

  const viewportRect = new Graphics();
  sprite.addChild(viewportRect);

  parent.addChild(sprite);

  const updateTexture = (texture: Texture) => {
    sprite.texture = texture;
  };

  const updateViewport = (worldContainer: Container) => {
    // Calculate Ratio (Minimap Pixel / World Pixel)
    // Minimap is 1:1, World is 16:1. Ratio is 1/16.
    const ratio = 1 / tileSize;

    // Calculate Position (Inverted world coordinates)
    const rectX = -worldContainer.x * ratio;
    const rectY = -worldContainer.y * ratio;

    // Calculate Size (Screen size scaled down)
    const rectW = app.screen.width * ratio;
    const rectH = app.screen.height * ratio;

    viewportRect.clear();
    viewportRect.rect(rectX, rectY, rectW, rectH);
    viewportRect.stroke({ width: 1, color: 0xff0000 });
  };

  return { updateTexture, updateViewport };
};
