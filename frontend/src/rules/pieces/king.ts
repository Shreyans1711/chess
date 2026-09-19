import type { Board, Move } from "@/components/Board/types";
import { getPiece, isSameSquare, setPiece } from "@/components/Board/utils";
import { PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { KING_CASTLE_FILE, ROOK_CASTLE_FILE } from "../constants";
import type { MoveContext, PieceRule } from "../types";
import {
  createRule,
  fileDistance,
  getCastlingSide,
  isSquareAttacked,
  rankDistance,
} from "../utils";

const stepRule = createRule(
  (_board, { from, to }) =>
    Math.max(fileDistance(from, to), rankDistance(from, to)) === 1,
);

/** Every file from `a` to `b`, both included, whichever is larger. */
function filesBetween(a: number, b: number): number[] {
  const first = Math.min(a, b);
  return Array.from({ length: Math.abs(a - b) + 1 }, (_, i) => first + i);
}

/**
 * Is the king on `from` allowed to castle with this move? Needs all of:
 * the right is intact and the rook is still there, every square the king and
 * the rook cross or land on is empty (apart from those two), and the king
 * is not in check, does not cross an attacked square and does not land on
 * one. This holds for any start files, so it covers Chess960 too.
 */
function isCastlingTarget(
  board: Board,
  move: Move,
  context: MoveContext,
): boolean {
  const { from } = move;
  const king = getPiece(board, from);
  const side = getCastlingSide(board, move, context);
  if (!king || !side || !context.castlingRights[king.color][side]) return false;

  const rank = from.rank;
  const rookFrom = { file: context.castlingFiles.rooks[side], rank };
  const rook = getPiece(board, rookFrom);
  if (rook?.type !== PieceType.Rook || rook.color !== king.color) return false;

  const kingFiles = filesBetween(from.file, KING_CASTLE_FILE[side]);
  const rookFiles = filesBetween(rookFrom.file, ROOK_CASTLE_FILE[side]);
  const isFree = [...kingFiles, ...rookFiles].every((file) => {
    const square = { file, rank };
    return (
      !getPiece(board, square) ||
      isSameSquare(square, from) ||
      isSameSquare(square, rookFrom)
    );
  });
  if (!isFree) return false;

  // Judge each square the king passes with both castling pieces off the
  // board, so the rook cannot be shielding the king from an attacker.
  const bare = setPiece(setPiece(board, from, null), rookFrom, null);
  const opponent = getOpponent(king.color);
  return kingFiles.every(
    (file) => !isSquareAttacked(bare, { file, rank }, opponent),
  );
}

// Moving into check is rejected separately, for every piece, by isValidTarget.
export const kingRule: PieceRule = {
  attacks: stepRule.attacks,
  isValidTarget: (board, move, context) =>
    stepRule.isValidTarget(board, move, context) ||
    isCastlingTarget(board, move, context),
};
