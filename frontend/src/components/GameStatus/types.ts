import type { Color } from "@/components/Piece/types";
import type { DrawReason, GameStatus } from "@/rules/types";

export type GameStatusProps = {
  status: GameStatus;
  /** Why the game is drawn. Only set when the status is Draw. */
  drawReason: DrawReason | null;
  /** The player to move. In a checkmate, this is the player who lost. */
  turn: Color;
};
