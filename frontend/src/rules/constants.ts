import { Color, PieceType } from "@/components/Piece/types";
import {
  CastlingSide,
  PawnDirection,
  PawnStartRank,
} from "./types";

export const PAWN_FORWARD: Record<Color, PawnDirection> = {
  [Color.White]: PawnDirection.Up,
  [Color.Black]: PawnDirection.Down,
};

export const PAWN_START_RANK: Record<Color, PawnStartRank> = {
  [Color.White]: PawnStartRank.White,
  [Color.Black]: PawnStartRank.Black,
};

/** The zero-based rank where each side's pawns promote. */
export const PROMOTION_RANK: Record<Color, number> = {
  [Color.White]: 7,
  [Color.Black]: 0,
};

/** What a pawn may become, in the order they are offered. */
export const PROMOTION_TYPES: readonly PieceType[] = [
  PieceType.Queen,
  PieceType.Rook,
  PieceType.Bishop,
  PieceType.Knight,
];

/** The game is drawn after this many half-moves without a pawn move or capture. */
export const FIFTY_MOVE_HALFMOVES = 100;

/** The game is drawn when the same position has occurred this many times. */
export const REPETITION_LIMIT = 3;

/** The zero-based rank each side's king and rooks start on. */
export const BACK_RANK: Record<Color, number> = {
  [Color.White]: 0,
  [Color.Black]: 7,
};

/** Where the king lands when castling (g-file or c-file). */
export const KING_CASTLE_FILE: Record<CastlingSide, number> = {
  [CastlingSide.KingSide]: 6,
  [CastlingSide.QueenSide]: 2,
};

/** Where the rook lands when castling (f-file or d-file). */
export const ROOK_CASTLE_FILE: Record<CastlingSide, number> = {
  [CastlingSide.KingSide]: 5,
  [CastlingSide.QueenSide]: 3,
};
