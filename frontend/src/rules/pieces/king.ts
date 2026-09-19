import type { Board, Move } from "@/components/Board/types";
import { getPiece, isSameSquare } from "@/components/Board/utils";
import { PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import {
  BACK_RANK,
  KING_CASTLE_FILE,
  KING_HOME_FILE,
  ROOK_HOME_FILE,
} from "../constants";
import { CastlingSide, type CastlingRights, type PieceRule } from "../types";
import {
  createRule,
  fileDistance,
  isPathClear,
  isSquareAttacked,
  rankDistance,
} from "../utils";

const stepRule = createRule(
  (_board, { from, to }) =>
    Math.max(fileDistance(from, to), rankDistance(from, to)) === 1,
);

/**
 * Is the king on `from` allowed to castle by moving to `to`? Needs all of:
 * the right is intact, the king is home with its rook, nothing stands
 * between them, and the king is not in check, does not cross an attacked
 * square and does not land on one.
 */
function isCastlingTarget(
  board: Board,
  { from, to }: Move,
  castlingRights: CastlingRights,
): boolean {
  const king = getPiece(board, from);
  if (!king) return false;

  const side = Object.values(CastlingSide).find(
    (candidate) => KING_CASTLE_FILE[candidate] === to.file,
  );
  const home = { file: KING_HOME_FILE, rank: BACK_RANK[king.color] };
  if (!side || to.rank !== home.rank || !isSameSquare(from, home)) return false;
  if (!castlingRights[king.color][side]) return false;

  const rookSquare = { file: ROOK_HOME_FILE[side], rank: home.rank };
  const rook = getPiece(board, rookSquare);
  if (rook?.type !== PieceType.Rook || rook.color !== king.color) return false;
  if (!isPathClear(board, from, rookSquare)) return false;

  const crossed = { file: (from.file + to.file) / 2, rank: home.rank };
  const opponent = getOpponent(king.color);
  return [from, crossed, to].every(
    (square) => !isSquareAttacked(board, square, opponent),
  );
}

// Moving into check is rejected separately, for every piece, by isValidTarget.
export const kingRule: PieceRule = {
  attacks: stepRule.attacks,
  isValidTarget: (board, move, context) =>
    stepRule.isValidTarget(board, move, context) ||
    isCastlingTarget(board, move, context.castlingRights),
};
