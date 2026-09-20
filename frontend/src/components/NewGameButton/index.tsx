import styles from "./styles.module.scss";
import type { NewGameButtonProps } from "./types";

export function NewGameButton({ onClick, label = "New game" }: NewGameButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
}
