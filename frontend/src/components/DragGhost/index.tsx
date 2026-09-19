import { Piece } from "@/components/Piece";
import styles from "./styles.module.scss";
import type { DragGhostProps } from "./types";

/** The copy of a piece that follows the pointer while dragging. */
export function DragGhost({ piece, x, y, size }: DragGhostProps) {
  return (
    <div
      className={styles.ghost}
      style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}
    >
      <Piece piece={piece} />
    </div>
  );
}
