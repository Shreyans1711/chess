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

export enum GameStatus {
  Playing = "playing",
  Check = "check",
  Checkmate = "checkmate",
  Draw = "draw",
}

/** Why a game ended in a draw. Stalemate is a draw, not a separate result. */
export enum DrawReason {
  Stalemate = "stalemate",
  FiftyMoveRule = "the fifty-move rule",
  ThreefoldRepetition = "threefold repetition",
  InsufficientMaterial = "insufficient material",
}

/** How a game stands: `drawReason` is set exactly when `status` is Draw. */
export type GameOutcome = {
  status: GameStatus;
  drawReason: DrawReason | null;
};

/** What the draw rules need to remember about the moves played so far. */
export type GameHistory = {
  /** Moves since the last pawn move or capture, counting each side's move. */
  halfmoveClock: number;
  /**
   * Keys of the positions reached since the last pawn move or capture (a
   * position cannot repeat across one). The last key is the current position.
   */
  positionKeys: string[];
};
