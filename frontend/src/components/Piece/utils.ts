import type { Square } from "@/components/Board/types";
import { STANDARD_BACK_RANK } from "./constants";
import { Color, PieceType, type Piece } from "./types";

/**
 * Which piece stands on this square at the start of a game whose back rank is
 * laid out as `backRank` (a-file to h-file)? Defaults to standard chess.
 * (Ranks are zero-based: 0 = rank 1, 7 = rank 8.)
 */
export function getStartingPiece(
  { file, rank }: Square,
  backRank: readonly PieceType[] = STANDARD_BACK_RANK,
): Piece | null {
  switch (rank) {
    case 0:
      return { type: backRank[file], color: Color.White };
    case 1:
      return { type: PieceType.Pawn, color: Color.White };
    case 6:
      return { type: PieceType.Pawn, color: Color.Black };
    case 7:
      return { type: backRank[file], color: Color.Black };
    default:
      return null;
  }
}

export function getOpponent(color: Color): Color {
  return color === Color.White ? Color.Black : Color.White;
}
