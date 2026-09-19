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
import { GameStatus } from "@/rules/types";
import {
  canThePieceMove,
  createHistory,
  getGameOutcome,
  isValidTarget,
  recordMove,
} from "@/rules/utils";

/** All the state of one game, and the actions that change it. */
export function useGame() {
  const [board, setBoard] = useState(createStartingBoard);
  const [selected, setSelected] = useState<Square | null>(null);
  const [turn, setTurn] = useState(Color.White);

  const [history, setHistory] = useState(() => createHistory(board, turn));

  const { status, drawReason } = getGameOutcome(board, turn, history);
  const isGameOver =
    status === GameStatus.Checkmate || status === GameStatus.Draw;

  /** Is there a piece on `square` that the player to move is able to move? */
  function canPickUp(square: Square): boolean {
    return (
      !isGameOver &&
      getPiece(board, square)?.color === turn &&
      canThePieceMove(board, square)
    );
  }

  // Plays the move and hands the turn to the other player.
  function playMove(from: Square, to: Square) {
    const result = movePiece(board, from, to);
    const nextTurn = getOpponent(turn);

    setBoard(result.board);
    setTurn(nextTurn);
    setHistory(recordMove(history, board, from, result, nextTurn));
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
    const startingBoard = createStartingBoard();

    setBoard(startingBoard);
    setSelected(null);
    setTurn(Color.White);
    setHistory(createHistory(startingBoard, Color.White));
  }

  return {
    board,
    selected,
    turn,
    status,
    drawReason,
    isGameOver,
    canPickUp,
    selectSquare,
    dropPiece,
    newGame,
  };
}
