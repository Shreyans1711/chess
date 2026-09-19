import { Color, PieceType } from "@/components/Piece/types";
import {
  CastlingSide,
  PawnDirection,
  PawnStartRank,
  type CastlingRights,
  type MoveContext,
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

/** The e-file: where the king starts, and so where castling starts from. */
export const KING_HOME_FILE = 4;

export const ROOK_HOME_FILE: Record<CastlingSide, number> = {
  [CastlingSide.KingSide]: 7,
  [CastlingSide.QueenSide]: 0,
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

const ALL_SIDES = {
  [CastlingSide.KingSide]: true,
  [CastlingSide.QueenSide]: true,
};

/** Everyone may castle either way, as at the start of a game. */
const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  [Color.White]: ALL_SIDES,
  [Color.Black]: ALL_SIDES,
};

/** The special-move state at the start of a game. */
export const INITIAL_MOVE_CONTEXT: MoveContext = {
  castlingRights: INITIAL_CASTLING_RIGHTS,
  enPassantTarget: null,
};
