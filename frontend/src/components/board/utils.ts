import { getStartingPiece } from "@/components/Piece/utils";
import type { Piece } from "@/components/Piece/types";
import { BOARD_INDEXES, FILE_NAMES } from "./constants";
import type { Board, MoveResult, Square } from "./types";

export function fileName(file: number): string {
  return FILE_NAMES[file];
}

export function rankName(rank: number): string {
  return String(rank + 1);
}

/** Algebraic name, e.g. { file: 4, rank: 3 } -> "e4". */
export function squareName({ file, rank }: Square): string {
  return fileName(file) + rankName(rank);
}

/** a1 is a dark square, so a square is light when file + rank is odd. */
export function isLightSquare({ file, rank }: Square): boolean {
  return (file + rank) % 2 === 1;
}

export function isSameSquare(a: Square, b: Square): boolean {
  return a.file === b.file && a.rank === b.rank;
}

/** Like isSameSquare, but accepts "no square" (null) as the first argument. */
export function isSquare(a: Square | null, b: Square): boolean {
  return a !== null && isSameSquare(a, b);
}

export function createStartingBoard(): Board {
  return BOARD_INDEXES.map((rank) =>
    BOARD_INDEXES.map((file) => getStartingPiece({ file, rank })),
  );
}

export function getPiece(board: Board, { file, rank }: Square): Piece | null {
  return board[rank][file];
}

/**
 * Moves the piece on `from` to `to`. No rules yet: any piece may go to any
 * square. Whatever stood on `to` is overwritten and reported as `captured`.
 * Returns a NEW board; the original is untouched.
 */
export function movePiece(board: Board, from: Square, to: Square): MoveResult {
  const piece = getPiece(board, from);
  if (!piece || isSameSquare(from, to)) return { board, captured: null };

  const newBoard = board.map((row, rank) =>
    row.map((cell, file) => {
      const square = { file, rank };
      if (isSameSquare(square, from)) return null;
      if (isSameSquare(square, to)) return piece;
      return cell;
    }),
  );

  return { board: newBoard, captured: getPiece(board, to) };
}
