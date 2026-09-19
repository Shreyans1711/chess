import { getPiece } from "@/components/Board/utils";
import { PAWN_FORWARD, PAWN_START_RANK } from "../constants";
import type { PieceRule } from "../types";
import { fileDistance } from "../utils";

// En passant and promotion are not implemented yet.
export const pawnRule: PieceRule = {
  // A pawn only threatens the two squares diagonally in front of it.
  attacks(board, from, to) {
    const pawn = getPiece(board, from);
    if (!pawn) return false;

    return (
      fileDistance(from, to) === 1 &&
      to.rank - from.rank === PAWN_FORWARD[pawn.color]
    );
  },

  isValidTarget(board, from, to) {
    const pawn = getPiece(board, from);
    if (!pawn) return false;

    const target = getPiece(board, to);

    // Diagonal step: only to capture.
    if (pawnRule.attacks(board, from, to)) {
      return target !== null && target.color !== pawn.color;
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
