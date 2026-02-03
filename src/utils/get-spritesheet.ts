import { Assets, Spritesheet } from "pixi.js";

type SpriteFrameData = {
  frame: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  spriteSourceSize: { x: number; y: number; w: number; h: number };
};

type Options = {
  frameWidth: number;
  frameHeight?: number;
};

export const getSpritesheet = async (
  url: string,
  name: string,
  options: Options,
) => {
  const texture = await Assets.load(url);

  // Determine dimensions
  const fW = options.frameWidth;
  const fH = options.frameHeight ?? fW; // If height is missing, we assume square

  // Automatically calculate how many frames fit in this row
  const frameCount = Math.floor(texture.width / fW);

  const data = {
    frames: {} as Record<string, SpriteFrameData>,
    meta: { scale: "1" },
  };

  for (let i = 0; i < frameCount; i++) {
    // Generate a unique key: "shore_0", "shore_1", etc.
    data.frames[`${name}_${i}`] = {
      frame: { x: i * fW, y: 0, w: fW, h: fH },
      sourceSize: { w: fW, h: fH },
      spriteSourceSize: { x: 0, y: 0, w: fW, h: fH },
    };
  }

  const sheet = new Spritesheet(texture, data);
  await sheet.parse();

  return sheet.textures;
};
