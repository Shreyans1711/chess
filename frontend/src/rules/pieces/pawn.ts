import type { Board, Move, Square } from "@/components/Board/types";
import { getPiece, isSameSquare } from "@/components/Board/utils";
import { PieceType } from "@/components/Piece/types";
import { PAWN_FORWARD, PAWN_START_RANK } from "../constants";
import type { PieceRule } from "../types";
import { fileDistance } from "../utils";

/**
 * Is `to` the square an enemy pawn just skipped over with a two-square push?
 * Then that pawn is standing right beside `from` and can be captured.
 */
function isEnPassantCapture(
  board: Board,
  { from, to }: Move,
  enPassantTarget: Square | null,
): boolean {
  if (!enPassantTarget || !isSameSquare(to, enPassantTarget)) return false;

  const pawn = getPiece(board, from);
  const beside = getPiece(board, { file: to.file, rank: from.rank });
  return (
    beside?.type === PieceType.Pawn &&
    beside.color !== pawn?.color &&
    !getPiece(board, to)
  );
}

// Promotion is handled outside the rules of movement: see isPromotionMove.
export const pawnRule: PieceRule = {
  // A pawn only threatens the two squares diagonally in front of it.
  attacks(board, { from, to }) {
    const pawn = getPiece(board, from);
    if (!pawn) return false;

    return (
      fileDistance(from, to) === 1 &&
      to.rank - from.rank === PAWN_FORWARD[pawn.color]
    );
  },

  isValidTarget(board, move, context) {
    const { from, to } = move;
    const pawn = getPiece(board, from);
    if (!pawn) return false;

    const target = getPiece(board, to);

    // Diagonal step: only to capture, including en passant.
    if (pawnRule.attacks(board, move)) {
      return target
        ? target.color !== pawn.color
        : isEnPassantCapture(board, move, context.enPassantTarget);
    }

    // Straight advance: only onto empty squares.
    if (from.file !== to.file || target) return false;

    const forward = PAWN_FORWARD[pawn.color];
    const steps = (to.rank - from.rank) * forward;
    if (steps === 1) return true;

    const middle = { file: from.file, rank: from.rank + forward };
    return (
      steps === 2 &&
      from.rank === PAWN_START_RANK[pawn.color] &&
      !getPiece(board, middle)
    );
  },
};
