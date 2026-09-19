import styles from "./styles.module.scss";
import type { PieceProps } from "./types";

// A <span> (not a <div>) because pieces live inside a <button>, which may
// only contain inline-level elements. The SCSS makes it fill the square.
export function Piece({ piece }: PieceProps) {
  const name = `${piece.color}-${piece.type}`;

  return (
    <span
      className={`${styles.piece} ${styles[name]}`}
      role="img"
      aria-label={`${piece.color} ${piece.type}`}
    />
  );
}
