import { useCallback, useEffect, useRef, useState } from "react";
import type { Square } from "@/components/Board/types";
import { DRAG_THRESHOLD_PX } from "./constants";
import type { DragStart, DragState } from "./types";
import { getSquareAtPoint } from "./utils";

/**
 * Tracks a piece being dragged. Call `startDrag` when the pointer goes down
 * on a piece; `onDrop` fires on release, but only for a real drag (not a
 * click), with the square under the pointer (null if off the board).
 */
export function usePieceDrag(
  onDrop: (from: Square, to: Square | null) => void,
) {
  // The state drives rendering; the ref lets the window listeners always
  // read the latest value without being re-attached on every mouse move.
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    onDropRef.current = onDrop;
  });

  const updateDrag = useCallback((next: DragState | null) => {
    dragRef.current = next;
    setDrag(next);
  }, []);

  const startDrag = useCallback(
    (start: DragStart) =>
      updateDrag({ ...start, startX: start.x, startY: start.y, moved: false }),
    [updateDrag],
  );

  const isDragging = drag !== null;

  // Listen on the window so the drag keeps working when the pointer leaves
  // the square (or the board) it started on.
  useEffect(() => {
    if (!isDragging) return;

    function handleMove(event: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;

      const distance = Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      );

      updateDrag({
        ...current,
        x: event.clientX,
        y: event.clientY,
        moved: current.moved || distance > DRAG_THRESHOLD_PX,
      });
    }

    function handleUp(event: PointerEvent) {
      const current = dragRef.current;
      updateDrag(null);
      if (current?.moved) {
        onDropRef.current(
          current.from,
          getSquareAtPoint(event.clientX, event.clientY),
        );
      }
    }

    function handleCancel() {
      updateDrag(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [isDragging, updateDrag]);

  return { drag, startDrag };
}
