import type { Square } from "@/chess/board.types";

export type BoardSquareProps = {
  square: Square;
  /** Show the rank number (drawn on the a-file). */
  showRank: boolean;
  /** Show the file letter (drawn on the bottom row). */
  showFile: boolean;
};
