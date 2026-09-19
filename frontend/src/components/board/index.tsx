import { BOARD_INDEXES } from "@/chess/board.constants";
import { squareName } from "@/chess/board.utils";
import styles from "./styles.module.scss";
import { BoardSquare } from "@/components/BoardSquare";

// The DOM draws top-to-bottom, but rank 8 is at the top of the board,
// so we walk ranks from 7 down to 0.
const RANKS_TOP_TO_BOTTOM = [...BOARD_INDEXES].reverse();

export function Board() {
  return (
    <div className={styles.board}>
      {RANKS_TOP_TO_BOTTOM.flatMap((rank) =>
        BOARD_INDEXES.map((file) => (
          <BoardSquare
            key={squareName({ file, rank })}
            square={{ file, rank }}
            showRank={file === 0}
            showFile={rank === 0}
          />
        )),
      )}
    </div>
  );
}
