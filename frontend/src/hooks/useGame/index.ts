import { useState } from "react";
import type { Square } from "@/components/Board/types";
import {
  createStartingBoard,
  getPiece,
  isSameSquare,
  movePiece,
} from "@/components/Board/utils";
import { Color } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { canThePieceMove, isValidTarget } from "@/rules/utils";

/** All the state of one game, and the actions that change it. */
export function useGame() {
  const [board, setBoard] = useState(createStartingBoard);
  const [selected, setSelected] = useState<Square | null>(null);
  const [turn, setTurn] = useState(Color.White);

  /** Is there a piece on `square` that the player to move is able to move? */
  function canPickUp(square: Square): boolean {
    return (
      getPiece(board, square)?.color === turn && canThePieceMove(board, square)
    );
  }

  // Plays the move and hands the turn to the other player.
  function playMove(from: Square, to: Square) {
    setBoard(movePiece(board, from, to).board);
    setTurn(getOpponent(turn));
    setSelected(null);
  }

  // Click-to-move: first click picks up one of your pieces, second drops it
  // on a valid target (any other square is ignored). Clicking another of your
  // own pieces switches the pick, and clicking the picked piece cancels it.
  function selectSquare(square: Square) {
    if (canPickUp(square)) {
      setSelected(selected && isSameSquare(selected, square) ? null : square);
    } else if (selected && isValidTarget(board, selected, square)) {
      playMove(selected, square);
    }
  }

  // Drag-to-move: the piece is dropped on `to`, or off the board (null),
  // in which case it simply stays where it was.
  function dropPiece(from: Square, to: Square | null) {
    if (!to || !canPickUp(from) || !isValidTarget(board, from, to)) return;

    playMove(from, to);
  }

  function newGame() {
    setBoard(createStartingBoard());
    setSelected(null);
    setTurn(Color.White);
  }

  return { board, selected, turn, canPickUp, selectSquare, dropPiece, newGame };
}
