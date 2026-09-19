import type { Board, Square } from "@/components/Board/types";

/** Answers a yes/no question about the piece standing on `from`. */
export type SquareTest = (board: Board, from: Square, to: Square) => boolean;

/** The movement rules of one kind of piece. */
export type PieceRule = {
  /**
   * Would this piece capture an enemy standing on `to`? Used to detect
   * check, so it ignores who (if anyone) is on `to`.
   */
  attacks: SquareTest;
  /** Can this piece move to `to`, by its own movement rules only? */
  isValidTarget: SquareTest;
};

/** Which way a pawn advances along the ranks. */
export enum PawnDirection {
  Up = 1,
  Down = -1,
}

/** The zero-based rank a side's pawns start on. */
export enum PawnStartRank {
  White = 1,
  Black = 6,
}
