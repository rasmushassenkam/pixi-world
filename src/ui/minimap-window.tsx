import { MouseEvent, useCallback } from "react"; // Changed imports
import { GameApp } from "../game/app";
import { ControlWindow } from "./control-window";

type Props = {
  game: GameApp;
};

export const MinimapWindow = ({ game }: Props) => {
  const setCanvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node) {
        game.attachMinimap(node);
      }
    },
    [game],
  );

  const handleMapClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Calculate Click Position relative to the element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to Percentage (0.0 to 1.0)
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;

    game.teleportTo(relativeX, relativeY);
  };

  return (
    <ControlWindow
      headerLabel="World Map"
      style={{ position: "absolute", bottom: 10, right: 10, width: 220 }}
    >
      <canvas
        ref={setCanvasRef}
        width={200}
        height={150}
        onClick={handleMapClick}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          background: "#000",
        }}
      />
    </ControlWindow>
  );
};
