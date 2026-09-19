import { PieceType } from "@/components/Piece/types";
import type { PieceRule } from "../types";
import { bishopRule } from "./bishop";
import { kingRule } from "./king";
import { knightRule } from "./knight";
import { pawnRule } from "./pawn";
import { queenRule } from "./queen";
import { rookRule } from "./rook";

export const PIECE_RULES: Record<PieceType, PieceRule> = {
  [PieceType.Pawn]: pawnRule,
  [PieceType.Knight]: knightRule,
  [PieceType.Bishop]: bishopRule,
  [PieceType.Rook]: rookRule,
  [PieceType.Queen]: queenRule,
  [PieceType.King]: kingRule,
};
