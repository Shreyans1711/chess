import type { Square } from "@/components/Board/types";
import type { Piece } from "@/components/Piece/types";

/** What the caller knows when the pointer goes down on a piece. */
export type DragStart = {
  from: Square;
  piece: Piece;
  /** Pointer position in screen pixels. */
  x: number;
  y: number;
  /** Width of a square in pixels, so the floating piece matches it. */
  size: number;
};

export type DragState = DragStart & {
  startX: number;
  startY: number;
  /**
   * False until the pointer travels a few pixels. This is how a plain click
   * (press and release in place) is told apart from a real drag.
   */
  moved: boolean;
};
