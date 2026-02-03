import { Assets, Container, Sprite, Spritesheet } from "pixi.js";
import { createNoise2D } from "simplex-noise";

const SPRITE_SIZE = 16;

const getSpritesheet = async (url: string, name: string) => {
  const texture = await Assets.load(url);
  const data = {
    frames: {},
    meta: { scale: "1" },
  };

  // Create 5 frames for the 1x5 sheet
  for (let i = 0; i < 5; i++) {
    data.frames[`${name}_${i}`] = {
      frame: { x: i * SPRITE_SIZE, y: 0, w: SPRITE_SIZE, h: SPRITE_SIZE },
      sourceSize: { w: SPRITE_SIZE, h: SPRITE_SIZE },
      spriteSourceSize: { x: 0, y: 0, w: SPRITE_SIZE, h: SPRITE_SIZE },
    };
  }

  const sheet = new Spritesheet(texture, data);
  await sheet.parse();
  return sheet.textures;
};

const noise2D = createNoise2D();

export const generateGround = async (width = 50, height = 50) => {
  // Load the ground textures
  const shoreTextures = await getSpritesheet("/assets/shore.png", "shore");
  const grassTextures = await getSpritesheet("/assets/grass.png", "grass");

  const mapContainer = new Container();
  const scale = 20; // "Zoom" level

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Generate noise value between -1 and 1, then normalize to 0 to 1
      // We divide x and y by 'scale' to ensure smooth transitions
      const rawNoise = noise2D(x / scale, y / scale);
      const elevation = (rawNoise + 1) / 2;

      let texture;

      // Elevation-based Biome Selection
      if (elevation < 0.15) {
        texture = shoreTextures[`shore_0`]; // Deep Water
      } else if (elevation < 0.4) {
        const index = Math.floor(((elevation - 0.15) / 0.25) * 4);
        texture = shoreTextures[`shore_${index}`]; // Shallow to Sand
      } else {
        // Map 0.4-1.0 to grass textures
        const index = Math.min(2, Math.floor(((elevation - 0.4) / 0.6) * 3));
        texture = grassTextures[`grass_${index}`];
      }

      const sprite = new Sprite(texture);
      sprite.x = x * SPRITE_SIZE;
      sprite.y = y * SPRITE_SIZE;
      mapContainer.addChild(sprite);
    }
  }

  return mapContainer;
};
