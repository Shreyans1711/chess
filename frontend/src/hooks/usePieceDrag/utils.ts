import type { Square } from "@/components/Board/types";

/**
 * Which board square is under this screen point? Each square in Board carries
 * data-file / data-rank attributes for exactly this lookup.
 * Returns null when the point is outside the board.
 */
export function getSquareAtPoint(x: number, y: number): Square | null {
  const element = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>("[data-file][data-rank]");

  if (!element) return null;

  return {
    file: Number(element.dataset.file),
    rank: Number(element.dataset.rank),
  };
}
