import { useState, useCallback, useRef, useEffect } from "react";

type Position = { x: number; y: number };

export const useDraggable = (initialPosition?: Position) => {
  const [position, setPosition] = useState<Position>(
    initialPosition || { x: 0, y: 0 },
  );

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 }); // Mouse position
  const initialPos = useRef({ x: 0, y: 0 }); // Window position

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow left-click drags
    if (e.button !== 0) return;

    // Find the window element (parent of the title bar)
    const windowElement = (e.target as HTMLElement).closest(
      ".window",
    ) as HTMLElement;
    if (!windowElement) return;

    isDragging.current = true;

    // Calculate the current absolute position in pixels
    const rect = windowElement.getBoundingClientRect();

    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: rect.left, y: rect.top };

    // Sync state to current visual position to prevent jumping
    setPosition({ x: rect.left, y: rect.top });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      setPosition({
        x: initialPos.current.x + deltaX,
        y: initialPos.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { position, handleMouseDown };
};
