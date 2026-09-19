import type { GameStatusProps } from "@/components/GameStatus/types";

/** Same as GameStatus (the finished game's outcome), plus what New game does. */
export type GameOverProps = GameStatusProps & {
  onNewGame: () => void;
};
