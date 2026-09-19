import { PieceType } from "@/components/Piece/types";

const BACK_RANK_SIZE = 8;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Removes a random file from `freeFiles` and returns it. */
function takeRandomFile(freeFiles: number[]): number {
  const file = pickRandom(freeFiles);
  freeFiles.splice(freeFiles.indexOf(file), 1);
  return file;
}

/**
 * A random Chess960 back rank, a-file to h-file: bishops on opposite colours
 * and the king somewhere between the two rooks. White and Black mirror each
 * other.
 */
export function createChess960BackRank(): PieceType[] {
  const rank: PieceType[] = Array(BACK_RANK_SIZE).fill(PieceType.Pawn);
  const free = [0, 1, 2, 3, 4, 5, 6, 7];

  // a1 is dark, so the odd files are the light squares on the back rank.
  const darkBishop = pickRandom(free.filter((file) => file % 2 === 0));
  const lightBishop = pickRandom(free.filter((file) => file % 2 === 1));
  for (const file of [darkBishop, lightBishop]) {
    rank[file] = PieceType.Bishop;
    free.splice(free.indexOf(file), 1);
  }

  rank[takeRandomFile(free)] = PieceType.Queen;
  rank[takeRandomFile(free)] = PieceType.Knight;
  rank[takeRandomFile(free)] = PieceType.Knight;

  // Three files are left: rook, king, rook from left to right.
  const [left, middle, right] = free;
  rank[left] = PieceType.Rook;
  rank[middle] = PieceType.King;
  rank[right] = PieceType.Rook;

  return rank;
}
