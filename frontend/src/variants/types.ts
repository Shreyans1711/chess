import type { Board } from "@/components/Board/types";
import type { MoveContext } from "@/rules/types";

/** What a game starts from: the position and its castling setup. */
export type NewGame = {
  board: Board;
  context: MoveContext;
};

/** Everything that makes one game different from another. */
export type Variant = {
  /** The URL segment: /<slug>. */
  slug: string;
  name: string;
  /** Sets up a game. Called again for every new game. */
  createGame: () => NewGame;
  /** Each turn is played with three rolled dice (see rules/dice.ts). */
  usesDice?: boolean;
};
