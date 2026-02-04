import { ComponentProps, useState } from "react";

type Props = ComponentProps<"div"> & { headerLabel: string };

export const ControlWindow = ({ headerLabel, ...props }: Props) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="window" {...props}>
      <div className="title-bar" onDoubleClick={() => setMinimized(!minimized)}>
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
