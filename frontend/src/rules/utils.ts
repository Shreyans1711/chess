import type { Board, Square } from "@/components/Board/types";
import { getAllSquares, getPiece, movePiece } from "@/components/Board/utils";
import { Color, PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { PIECE_RULES } from "./pieces";
import type { PieceRule, SquareTest } from "./types";

export function fileDistance(from: Square, to: Square): number {
  return Math.abs(to.file - from.file);
}

export function rankDistance(from: Square, to: Square): number {
  return Math.abs(to.rank - from.rank);
}

export function isDiagonal(from: Square, to: Square): boolean {
  return (
    from.file !== to.file && fileDistance(from, to) === rankDistance(from, to)
  );
}

/** Same file or same rank, but not both (that would be the same square). */
export function isStraight(from: Square, to: Square): boolean {
  return (from.file === to.file) !== (from.rank === to.rank);
}

/** Are all squares strictly between `from` and `to` empty? They must be in line. */
export function isPathClear(board: Board, from: Square, to: Square): boolean {
  const stepFile = Math.sign(to.file - from.file);
  const stepRank = Math.sign(to.rank - from.rank);
  let file = from.file + stepFile;
  let rank = from.rank + stepRank;

  while (file !== to.file || rank !== to.rank) {
    if (getPiece(board, { file, rank })) return false;
    file += stepFile;
    rank += stepRank;
  }
  return true;
}

/**
 * For every piece except the pawn, moving and capturing work the same way:
 * it may go anywhere it attacks, unless one of its own pieces is there.
 */
export function createRule(attacks: SquareTest): PieceRule {
  return {
    attacks,
    isValidTarget: (board, from, to) =>
      attacks(board, from, to) &&
      getPiece(board, to)?.color !== getPiece(board, from)?.color,
  };
}

/**
 * Can the piece on `from` move at all? False when it has no valid target:
 * it is blocked in, pinned against its king, or (for the king) every
 * square around it is attacked or occupied.
 */
export function canThePieceMove(board: Board, from: Square): boolean {
  return getAllSquares().some((to) => isValidTarget(board, from, to));
}

/** Is `square` attacked by any piece of colour `by`? */
export function isSquareAttacked(
  board: Board,
  square: Square,
  by: Color,
): boolean {
  return getAllSquares().some((from) => {
    const piece = getPiece(board, from);
    return (
      piece?.color === by &&
      PIECE_RULES[piece.type].attacks(board, from, square)
    );
  });
}

export function findKing(board: Board, color: Color): Square | null {
  return (
    getAllSquares().find((square) => {
      const piece = getPiece(board, square);
      return piece?.type === PieceType.King && piece.color === color;
    }) ?? null
  );
}

export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  return king !== null && isSquareAttacked(board, king, getOpponent(color));
}

/**
 * Can the piece on `from` move to `to`? It must follow its own movement
 * rules (including captures), and the move must not leave its own king in
 * check. That second part is what keeps a pinned piece on its line, and
 * stops the king from stepping onto an attacked square.
 */
export function isValidTarget(board: Board, from: Square, to: Square): boolean {
  const piece = getPiece(board, from);
  if (!piece || !PIECE_RULES[piece.type].isValidTarget(board, from, to)) {
    return false;
  }

  return !isInCheck(movePiece(board, from, to).board, piece.color);
}
