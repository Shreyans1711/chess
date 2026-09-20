import type { Color } from "@/components/Piece/types";
import type { Die } from "@/rules/types";

export type DiceProps = {
  dice: Die[];
  /** Changes with every roll, which restarts the rolling animation. */
  rollId: number;
  /** The player to move, so the dice show their pieces. */
  color: Color;
};
