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

const BIOME_COLORS: [number, number, number][] = [
  [0x42, 0xac, 0xaf], // 0: Abyss
  [0x4e, 0xbc, 0xb9], // 1: Deep Ocean
  [0x77, 0xc0, 0xb4], // 2: Ocean
  [0xb1, 0xc9, 0xa7], // 3: Shallow/Foam
  [0xe7, 0xd5, 0x93], // 4: Sand
  [0xc3, 0xd6, 0x57], // 5: Meadow
  [0xb1, 0xd3, 0x54], // 6: Light Grass
  [0x69, 0xa3, 0x48], // 7: Dense Forest
  [0x7e, 0x79, 0x66], // 8: Mountain Rock
  [0xe3, 0xe8, 0xe6], // 9: Snow Peak
];

const MAX_LEVEL = 9;

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
  const groundTextures = await getSpritesheet("/assets/ground.png", "ground", {
    frameWidth: 16,
  });

  const rng = seedrandom(settings.seed);
  const noise2D = createNoise2D(rng);
  const mapContainer = new Container();
  const minimap = createMinimapBuffer(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = getElevation(x, y, noise2D, settings);

      let tileIdx = Math.floor(elevation * (MAX_LEVEL + 1));

      tileIdx = Math.max(0, Math.min(MAX_LEVEL, tileIdx));

      const texture = groundTextures[`ground_${tileIdx}`];
      const sprite = new Sprite(texture);
      sprite.x = x * 16;
      sprite.y = y * 16;
      mapContainer.addChild(sprite);

      minimap.setPixel(x, y, BIOME_COLORS[tileIdx]);
    }
  }

  return {
    container: mapContainer,
    minimapTexture: minimap.getTexture(),
  };
};
