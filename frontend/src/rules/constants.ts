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
