import { PieceType } from "@/components/Piece/types";
import { bishopRule } from "../pieces/bishop";
import { kingRule } from "../pieces/king";
import { knightRule } from "../pieces/knight";
import { pawnRule } from "../pieces/pawn";
import { queenRule } from "../pieces/queen";
import { rookRule } from "../pieces/rook";
import type { PieceRule } from "../types";

// Only read inside functions, never while modules load: the piece files
// import rules/utils back (for createRule), so the table isn't ready until
// every module has finished loading.
export const PIECE_RULES: Record<PieceType, PieceRule> = {
  [PieceType.Pawn]: pawnRule,
  [PieceType.Knight]: knightRule,
  [PieceType.Bishop]: bishopRule,
  [PieceType.Rook]: rookRule,
  [PieceType.Queen]: queenRule,
  [PieceType.King]: kingRule,
};
