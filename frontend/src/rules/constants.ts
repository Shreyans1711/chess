import { Color } from "@/components/Piece/types";
import { PawnDirection, PawnStartRank } from "./types";

export const PAWN_FORWARD: Record<Color, PawnDirection> = {
  [Color.White]: PawnDirection.Up,
  [Color.Black]: PawnDirection.Down,
};

export const PAWN_START_RANK: Record<Color, PawnStartRank> = {
  [Color.White]: PawnStartRank.White,
  [Color.Black]: PawnStartRank.Black,
};

/** The game is drawn after this many half-moves without a pawn move or capture. */
export const FIFTY_MOVE_HALFMOVES = 100;

/** The game is drawn when the same position has occurred this many times. */
export const REPETITION_LIMIT = 3;
