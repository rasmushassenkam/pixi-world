import { World } from "miniplex";
import { Entity } from "./types";

export const ecs = new World<Entity>();

export const renderableEntities = ecs.with("position", "sprite");

export const trees = ecs.with("position", "isTree");

let nextId = 1;
export const createEntity = (components: Partial<Entity>) => {
  return ecs.add({
    id: nextId++,
    ...components,
  });
};
