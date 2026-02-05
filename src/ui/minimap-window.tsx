import { useCallback } from "react"; // Changed imports
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

  return (
    <ControlWindow
      headerLabel="World Map"
      style={{ position: "absolute", bottom: 10, right: 10, width: 220 }}
    >
      <canvas
        ref={setCanvasRef}
        width={200}
        height={150}
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
