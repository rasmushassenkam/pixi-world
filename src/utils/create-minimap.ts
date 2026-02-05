import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";

const TARGET_WIDTH = 200;
const PADDING = 20;

export const createMinimap = (
  app: Application,
  parent: Container,
  tileSize: number,
) => {
  const sprite = new Sprite();

  const border = new Graphics();
  const viewportRect = new Graphics();

  sprite.addChild(border);
  sprite.addChild(viewportRect);
  parent.addChild(sprite);

  // Align the minimap to the bottom-right of the screen
  const updatePosition = () => {
    sprite.x = app.screen.width - sprite.width - PADDING;
    sprite.y = app.screen.height - sprite.height - PADDING;
  };

  const updateTexture = (texture: Texture) => {
    sprite.texture = texture;

    // Calculate Scale
    const scale = TARGET_WIDTH / texture.width;
    sprite.scale.set(scale);

    // Redraw Border
    border.clear();
    border.rect(0, 0, texture.width, texture.height);
    border.stroke({ width: 2 / scale, color: 0xffffff });

    // Re-anchor to bottom right
    updatePosition();
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

    const currentScale = sprite.scale.x || 1;
    viewportRect.stroke({ width: 1 / currentScale, color: 0xff0000 });
  };
  app.renderer.on("resize", updatePosition);

  return { updateTexture, updateViewport };
};
