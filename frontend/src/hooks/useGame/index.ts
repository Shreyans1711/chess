import { useState } from "react";
import type { Move, Square } from "@/components/Board/types";
import { getPiece, isSameSquare } from "@/components/Board/utils";
import { Color, type PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { GameStatus } from "@/rules/types";
import type { Variant } from "@/variants/types";
import {
  applyMove,
  canThePieceMove,
  createHistory,
  getGameOutcome,
  isPromotionMove,
  isValidTarget,
  recordMove,
  updateMoveContext,
} from "@/rules/utils";

/** All the state of one game, and the actions that change it. */
export function useGame({ createGame }: Variant) {
  const [start] = useState(createGame);
  const [board, setBoard] = useState(start.board);
  const [selected, setSelected] = useState<Square | null>(null);
  const [turn, setTurn] = useState(Color.White);
  // A pawn move waiting for the player to choose what it becomes.
  const [pendingPromotion, setPendingPromotion] = useState<Move | null>(null);

  // Castling rights and the en passant square: what the board can't show.
  const [context, setContext] = useState(start.context);
  const [history, setHistory] = useState(() =>
    createHistory(board, turn, context),
  );

  const { status, drawReason } = getGameOutcome(board, turn, history, context);
  const isGameOver =
    status === GameStatus.Checkmate || status === GameStatus.Draw;

  /** Is there a piece on `square` that the player to move is able to move? */
  function canPickUp(square: Square): boolean {
    return (
      !isGameOver &&
      !pendingPromotion &&
      getPiece(board, square)?.color === turn &&
      canThePieceMove(board, square, context)
    );
  }

  // Plays the move and hands the turn to the other player.
  function playMove(move: Move, promotion?: PieceType) {
    const result = applyMove(board, move, context, promotion);
    const nextTurn = getOpponent(turn);
    const nextContext = updateMoveContext(context, board, move);

    setBoard(result.board);
    setTurn(nextTurn);
    setContext(nextContext);
    setHistory(recordMove(history, board, move, result, nextTurn, nextContext));
    setSelected(null);
    setPendingPromotion(null);
  }

  // Click and drag both end here with a move already known to be valid. A
  // pawn reaching the last rank waits until the player picks its new piece.
  function requestMove(move: Move) {
    if (isPromotionMove(board, move)) {
      setPendingPromotion(move);
      setSelected(null);
    } else {
      playMove(move);
    }
  }

  function completePromotion(type: PieceType) {
    if (pendingPromotion) playMove(pendingPromotion, type);
  }

  function cancelPromotion() {
    setPendingPromotion(null);
  }

  // Click-to-move: first click picks up one of your pieces, second drops it
  // on a valid target (any other square is ignored). Clicking another of your
  // own pieces switches the pick, and clicking the picked piece cancels it.
  function selectSquare(square: Square) {
    if (canPickUp(square)) {
      setSelected(selected && isSameSquare(selected, square) ? null : square);
    } else if (selected) {
      const move = { from: selected, to: square };
      if (isValidTarget(board, move, context)) requestMove(move);
    }
  }

  // Drag-to-move: the piece is dropped on `to`, or off the board (null),
  // in which case it simply stays where it was.
  function dropPiece(from: Square, to: Square | null) {
    if (!to || !canPickUp(from)) return;

    const move = { from, to };
    if (isValidTarget(board, move, context)) requestMove(move);
  }

  function newGame() {
    const { board: startingBoard, context: startingContext } = createGame();

    setBoard(startingBoard);
    setSelected(null);
    setPendingPromotion(null);
    setTurn(Color.White);
    setContext(startingContext);
    setHistory(createHistory(startingBoard, Color.White, startingContext));
  }

  return {
    board,
    selected,
    turn,
    status,
    drawReason,
    isGameOver,
    isPromoting: pendingPromotion !== null,
    canPickUp,
    selectSquare,
    dropPiece,
    completePromotion,
    cancelPromotion,
    newGame,
  };
}
