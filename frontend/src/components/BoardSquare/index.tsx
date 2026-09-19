import { fileName, isLightSquare, rankName } from "@/chess/board.utils";
import styles from "./styles.module.scss";
import type { BoardSquareProps } from "./types";

export function BoardSquare({ square, showRank, showFile }: BoardSquareProps) {
  const shade = isLightSquare(square) ? styles.light : styles.dark;

  return (
    <div className={`${styles.square} ${shade}`}>
      {showRank && (
        <span className={`${styles.label} ${styles.rank}`}>
          {rankName(square.rank)}
        </span>
      )}
      {showFile && (
        <span className={`${styles.label} ${styles.file}`}>
          {fileName(square.file)}
        </span>
      )}
    </div>
  );
}
