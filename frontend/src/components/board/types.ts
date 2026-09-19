import type { Piece } from "@/components/Piece/types";

/**
 * Square coordinates, zero-based:
 *   file: 0..7 (a..h, left to right from White's side)
 *   rank: 0..7 (1..8, bottom to top from White's side)
 * So a1 = { file: 0, rank: 0 } and h8 = { file: 7, rank: 7 }.
 */
export type Square = {
  file: number;
  rank: number;
};

/**
 * The board is a grid indexed as board[rank][file], matching Square.
 * An empty square is null. It is never edited in place: functions return
 * a new board, which is what lets React notice the change.
 */
export type Board = (Piece | null)[][];

/** What a move produces: the new board, plus the piece it removed (if any). */
export type MoveResult = {
  board: Board;
  captured: Piece | null;
};
