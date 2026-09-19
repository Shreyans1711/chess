import { NewGameButton } from "@/components/NewGameButton";
import { getOpponent } from "@/components/Piece/utils";
import { GameStatus } from "@/rules/types";
import { capitalize } from "@/utils/capitalize";
import styles from "./styles.module.scss";
import type { GameOverProps } from "./types";

/** Who won (or that it's a draw), and how. */
function getResult({ status, drawReason, turn }: GameOverProps) {
  if (status === GameStatus.Checkmate) {
    // The player to move is the one who has been checkmated.
    return {
      title: `${capitalize(getOpponent(turn))} wins`,
      reason: "by checkmate",
    };
  }
  return { title: "Draw", reason: `by ${drawReason}` };
}

/** Covers the board when the game is over, and offers a new game. */
export function GameOver(props: GameOverProps) {
  const { title, reason } = getResult(props);

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="alertdialog" aria-label="Game over">
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.reason}>{reason}</p>
        <NewGameButton onClick={props.onNewGame} />
      </div>
    </div>
  );
}
