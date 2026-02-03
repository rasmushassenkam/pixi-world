import { Container, Sprite } from "pixi.js";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";
import { getSpritesheet } from "../utils/get-spritesheet";

export const generateGround = async (
  width = 300,
  height = 120,
  settings = {
    scale: 20,
    octaves: 3,
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

  const rng = seedrandom(settings.seed);
  const noise2D = createNoise2D(rng);

  const mapContainer = new Container();

  // Define the "Water Level" - anything below this is Shore, above is Grass
  const WATER_LEVEL = 0.5;

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

      if (elevation < WATER_LEVEL) {
        // --- SHORE LOGIC ---
        // Map 0.0 (Deep) -> WATER_LEVEL (Coast)
        // To Indices: 4 (Abyss) -> 0 (Sand)

        // Calculate how "deep" we are (0.0 = At coast, 1.0 = Deepest abyss)
        const depth = 1 - elevation / WATER_LEVEL;

        // Map depth to indices 0-4
        let shoreIdx = Math.floor(depth * 5);

        // Clamp to ensure we stay within 0-4 range
        shoreIdx = Math.max(0, Math.min(4, shoreIdx));

        texture = shoreTextures[`shore_${shoreIdx}`];
      } else {
        // --- GRASS LOGIC ---
        // Map WATER_LEVEL (Coast) -> 1.0 (Mountain)
        // To Indices: 1 (Light Grass) -> 2 (Dark Grass)
        // Note: We skip Index 0 because you said it's "Water"

        // Normalized land height (0.0 = Just on coast, 1.0 = High peak)
        const landHeight = (elevation - WATER_LEVEL) / (1 - WATER_LEVEL);

        // If low land (e.g., < 50% of land height), use Light Grass (1)
        // If high land, use Dark Grass (2)
        const grassIdx = landHeight < 0.5 ? 1 : 2;

        texture = grassTextures[`grass_${grassIdx}`];
      }

      const sprite = new Sprite(texture);
      sprite.x = x * 16;
      sprite.y = y * 16;
      mapContainer.addChild(sprite);
    }
  }

  return mapContainer;
};
