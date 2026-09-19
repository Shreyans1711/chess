import { FILE_NAMES } from "./board.constants";
import type { Square } from "./board.types";

export function fileName(file: number): string {
  return FILE_NAMES[file];
}

export function rankName(rank: number): string {
  return String(rank + 1);
}

/** Algebraic name, e.g. { file: 4, rank: 3 } -> "e4". */
export function squareName({ file, rank }: Square): string {
  return fileName(file) + rankName(rank);
}

/** a1 is a dark square, so a square is light when file + rank is odd. */
export function isLightSquare({ file, rank }: Square): boolean {
  return (file + rank) % 2 === 1;
}
