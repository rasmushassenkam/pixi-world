import { Sprite } from "pixi.js";

export type Entity = {
  id: number;
  position?: { x: number; y: number };
  sprite?: Sprite;
  isTree?: boolean;
  health?: { current: number; max: number };
  harvestable?: { resource: string; amount: number };
};
