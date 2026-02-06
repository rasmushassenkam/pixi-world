import { ComponentProps, useState } from "react";
import { useDraggable } from "./use-draggable";

type Props = ComponentProps<"div"> & { headerLabel: string };

export const ControlWindow = ({ headerLabel, style, ...props }: Props) => {
  const [minimized, setMinimized] = useState(false);
  const { position, handleMouseDown } = useDraggable();
  const isMoved = position.x !== 0 || position.y !== 0;

  const finalStyle = {
    ...style,
    ...(isMoved
      ? {
          left: position.x,
          top: position.y,
          right: "auto",
          bottom: "auto",
          transform: "none",
        }
      : {}),
  };

  return (
    <div className="window" style={finalStyle} {...props}>
      <div
        className="title-bar"
        onDoubleClick={() => setMinimized(!minimized)}
        onMouseDown={handleMouseDown}
      >
        <div className="title-bar-text">{headerLabel}</div>
        <div className="title-bar-controls">
          <button
            aria-label={minimized ? "Restore" : "Minimize"}
            onClick={() => setMinimized(!minimized)}
          />
        </div>
      </div>
      {!minimized && <div className="window-body">{props.children}</div>}
    </div>
  );
};
