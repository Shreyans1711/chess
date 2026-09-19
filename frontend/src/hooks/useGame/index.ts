import { useState } from "react";
import type { Square } from "@/components/Board/types";
import {
  createStartingBoard,
  getPiece,
  isSameSquare,
  movePiece,
} from "@/components/Board/utils";

/** All the state of one game, and the actions that change it. */
export function useGame() {
  const [board, setBoard] = useState(createStartingBoard);
  const [selected, setSelected] = useState<Square | null>(null);

  // Click-to-move: first click picks up a piece, second drops it anywhere.
  function selectSquare(square: Square) {
    if (!selected) {
      if (getPiece(board, square)) setSelected(square);
      return;
    }

    setBoard(movePiece(board, selected, square).board);
    setSelected(null);
  }

  // Drag-to-move: the piece is dropped on `to`, or off the board (null),
  // in which case it simply stays where it was.
  function dropPiece(from: Square, to: Square | null) {
    if (!to || isSameSquare(from, to)) return;

    setBoard(movePiece(board, from, to).board);
    setSelected(null);
  }

  function newGame() {
    setBoard(createStartingBoard());
    setSelected(null);
  }

  return { board, selected, selectSquare, dropPiece, newGame };
}
