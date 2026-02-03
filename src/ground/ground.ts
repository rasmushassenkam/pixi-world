import { Container, Sprite } from "pixi.js";
import { createNoise2D } from "simplex-noise";
import { getSpritesheet } from "../utils/get-spritesheet";

const noise2D = createNoise2D();

export const generateGround = async (width = 50, height = 50) => {
  // Load the ground textures
  const shoreTextures = await getSpritesheet("/assets/shore.png", "shore", {
    frameWidth: 16,
  });
  const grassTextures = await getSpritesheet("/assets/grass.png", "grass", {
    frameWidth: 16,
  });

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
      sprite.x = x * 16;
      sprite.y = y * 16;
      mapContainer.addChild(sprite);
    }
  }

  return mapContainer;
};
