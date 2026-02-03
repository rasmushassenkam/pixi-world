import { Container, Sprite, Texture } from "pixi.js";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import seedrandom from "seedrandom";
import { getSpritesheet } from "../utils/get-spritesheet";

export type GroundSettings = {
  scale: number;
  octaves: number;
  persistence: number;
  exponent: number;
  seed: string;
};

type BiomeData = {
  texture: Texture;
  color: [number, number, number]; // RGB for minimap
};

type TextureSet = Record<string, Texture>;

const getElevation = (
  x: number,
  y: number,
  noise2D: NoiseFunction2D,
  settings: GroundSettings,
): number => {
  let elevation = 0;
  let amplitude = 1;
  let frequency = 1 / settings.scale;
  let maxAmplitude = 0;

  for (let i = 0; i < settings.octaves; i++) {
    elevation += noise2D(x * frequency, y * frequency) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= settings.persistence;
    frequency *= 2;
  }

  elevation = (elevation / maxAmplitude + 1) / 2;
  return Math.pow(elevation, settings.exponent);
};

const WATER_LEVEL = 0.5;

const getBiomeDetails = (
  elevation: number,
  shoreTextures: TextureSet,
  grassTextures: TextureSet,
): BiomeData => {
  // --- WATER / SHORE ---
  if (elevation < WATER_LEVEL) {
    const depth = 1 - elevation / WATER_LEVEL;
    // Map depth (0.0-1.0) to indices 0-4.
    // 0 is Coast (Sand), 4 is Abyss.
    const shoreIdx = Math.max(0, Math.min(4, Math.floor(depth * 5)));
    const texture = shoreTextures[`shore_${shoreIdx}`];

    // Colors: Deep Blue -> Cyan -> Sand
    let color: [number, number, number];
    switch (shoreIdx) {
      case 4:
        color = [20, 20, 80];
        break; // Abyss
      case 3:
        color = [40, 60, 150];
        break; // Deep
      case 2:
        color = [60, 100, 200];
        break; // Water
      case 1:
        color = [100, 180, 240];
        break; // Shallow
      default:
        color = [210, 200, 130];
        break; // Sand (0)
    }

    return { texture, color };
  }

  // --- LAND / GRASS ---
  else {
    const landHeight = (elevation - WATER_LEVEL) / (1 - WATER_LEVEL);
    const grassIdx = landHeight < 0.5 ? 1 : 2;
    const texture = grassTextures[`grass_${grassIdx}`];

    // Colors: Light Green -> Dark Green
    const color: [number, number, number] =
      grassIdx === 1 ? [100, 180, 80] : [40, 100, 40];

    return { texture, color };
  }
};

const createMinimapBuffer = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);
  const pixels = imgData.data;

  const setPixel = (
    x: number,
    y: number,
    [r, g, b]: [number, number, number],
  ) => {
    const idx = (y * width + x) * 4;
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = 255;
  };

  const getTexture = () => {
    ctx.putImageData(imgData, 0, 0);
    return Texture.from(canvas);
  };

  return { setPixel, getTexture };
};

export const generateGround = async (
  width = 300,
  height = 120,
  settings: GroundSettings,
) => {
  const [shoreTextures, grassTextures] = await Promise.all([
    getSpritesheet("/assets/shore.png", "shore", { frameWidth: 16 }),
    getSpritesheet("/assets/grass.png", "grass", { frameWidth: 16 }),
  ]);

  const rng = seedrandom(settings.seed);
  const noise2D = createNoise2D(rng);
  const mapContainer = new Container();
  const minimap = createMinimapBuffer(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = getElevation(x, y, noise2D, settings);

      const { texture, color } = getBiomeDetails(
        elevation,
        shoreTextures,
        grassTextures,
      );

      const sprite = new Sprite(texture);
      sprite.x = x * 16;
      sprite.y = y * 16;
      mapContainer.addChild(sprite);

      minimap.setPixel(x, y, color);
    }
  }

  return {
    container: mapContainer,
    minimapTexture: minimap.getTexture(),
  };
};
