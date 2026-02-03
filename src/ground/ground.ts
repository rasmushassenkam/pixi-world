import { Container, Sprite } from "pixi.js";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";
import { getSpritesheet } from "../utils/get-spritesheet";

export const generateGround = async (
  width = 300,
  height = 120,
  settings = {
    scale: 10,
    octaves: 1,
    persistence: 0.5,
    exponent: 1.0,
    seed: "my-seed",
  },
) => {
  // Load the ground textures
  const shoreTextures = await getSpritesheet("/assets/shore.png", "shore", {
    frameWidth: 16,
  });
  const grassTextures = await getSpritesheet("/assets/grass.png", "grass", {
    frameWidth: 16,
  });

  // Create the RNG based on the seed
  const rng = seedrandom(settings.seed);
  const noise2D = createNoise2D(rng);

  const mapContainer = new Container();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let elevation = 0;
      let amplitude = 1;
      let frequency = 1 / settings.scale;
      let maxAmplitude = 0;

      // OCTAVES LOOP
      // Accumulate multiple layers of noise
      for (let i = 0; i < settings.octaves; i++) {
        elevation += noise2D(x * frequency, y * frequency) * amplitude;
        maxAmplitude += amplitude;

        // Decrease amplitude for next layer (persistence)
        amplitude *= settings.persistence;
        // Increase frequency for next layer
        frequency *= 2;
      }

      // NORMALIZATION
      // Convert raw noise (approx -maxAmp to +maxAmp) to range 0.0 to 1.0
      elevation = (elevation / maxAmplitude + 1) / 2;

      // REDISTRIBUTION
      // Apply power function to push values closer to 0 or 1
      elevation = Math.pow(elevation, settings.exponent);

      let texture;

      if (elevation < 0.15) {
        texture = shoreTextures[`shore_0`]; // Deep Water
      } else if (elevation < 0.4) {
        // Map 0.15-0.4 to shore textures
        const index = Math.floor(((elevation - 0.15) / 0.25) * 4);
        // Clamp index to prevent potential array overflow
        const safeIndex = Math.max(0, Math.min(3, index));
        texture = shoreTextures[`shore_${safeIndex}`];
      } else {
        // Map 0.4-1.0 to grass textures
        const index = Math.min(2, Math.floor(((elevation - 0.4) / 0.6) * 3));
        const safeIndex = Math.max(0, index);
        texture = grassTextures[`grass_${safeIndex}`];
      }

      const sprite = new Sprite(texture);
      sprite.x = x * 16;
      sprite.y = y * 16;
      mapContainer.addChild(sprite);
    }
  }

  return mapContainer;
};
