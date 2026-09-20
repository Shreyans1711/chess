import { getOpponent } from "@/components/Piece/utils";
import { GameStatus as Status } from "@/rules/types";
import { capitalize } from "@/utils";
import styles from "./styles.module.scss";
import type { GameStatusProps } from "./types";

function getMessage({ status, drawReason, turn }: GameStatusProps): string {
  switch (status) {
    case Status.Checkmate:
      return `Checkmate, ${capitalize(getOpponent(turn))} wins`;
    case Status.KingCaptured:
      return `King captured, ${capitalize(getOpponent(turn))} wins`;
    case Status.Draw:
      return `Draw by ${drawReason}`;
    case Status.Check:
      return `${capitalize(turn)} to move, in check`;
    default:
      return `${capitalize(turn)} to move`;
  }
}

/** Says whose turn it is, or how the game ended. */
export function GameStatus(props: GameStatusProps) {
  return (
    <p className={styles.status} role="status">
      {getMessage(props)}
    </p>
  );
}
