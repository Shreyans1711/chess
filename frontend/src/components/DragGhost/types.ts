import type { Piece } from "@/components/Piece/types";

export type DragGhostProps = {
  piece: Piece;
  /** Pointer position in screen pixels; the piece is centred on it. */
  x: number;
  y: number;
  /** Width and height in pixels (the size of one board square). */
  size: number;
};
