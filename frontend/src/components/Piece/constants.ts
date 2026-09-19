import { PieceType } from "./types";

/** Standard chess: piece order on the back rank, a-file to h-file. */
export const STANDARD_BACK_RANK: readonly PieceType[] = [
  PieceType.Rook,
  PieceType.Knight,
  PieceType.Bishop,
  PieceType.Queen,
  PieceType.King,
  PieceType.Bishop,
  PieceType.Knight,
  PieceType.Rook,
];
