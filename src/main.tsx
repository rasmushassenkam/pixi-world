import React from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "./game/app";
import { TerrainControls } from "./ui/terrain-controls/terrain-controls";
import { MinimapWindow } from "./ui/minimap-window";
import "../public/style.css";

const container = document.getElementById("pixi-container") as HTMLElement;
const uiRoot = document.getElementById("ui-root") as HTMLElement;
const game = new GameApp(container);
const root = createRoot(uiRoot);

root.render(
  <React.StrictMode>
    <TerrainControls onUpdate={(s) => game.updateSettings(s)} />
    <MinimapWindow game={game} />
  </React.StrictMode>,
);
