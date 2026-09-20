import { useEffect, useMemo, useState } from "react";
import type { Move, Square } from "@/components/Board/types";
import { getPiece, isSameSquare } from "@/components/Board/utils";
import { Color, PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { continueTurn, getDiceMoves, getDiceOutcome, rollDice } from "@/rules/dice";
import { GameStatus, type DiceMove, type Die } from "@/rules/types";
import { ROLL_ANIMATION_MS } from "@/components/Dice/constants";
import type { Variant } from "@/variants/types";
import {
  applyMove,
  canThePieceMove,
  createHistory,
  getGameOutcome,
  isPromotionMove,
  isValidTarget,
  recordMove,
  recordPass,
  updateMoveContext,
} from "@/rules/utils";

function rollTurnDice(usesDice: boolean): Die[] {
  return usesDice ? rollDice().map((type) => ({ type, used: false })) : [];
}

function unusedTypes(dice: Die[]): PieceType[] {
  return dice.filter((die) => !die.used).map((die) => die.type);
}

function isSameMove(a: Move, b: Move): boolean {
  return isSameSquare(a.from, b.from) && isSameSquare(a.to, b.to);
}

/** How long a roll with no playable die stays on screen before the turn passes. */
const PASS_DELAY_MS = ROLL_ANIMATION_MS + 2000;

function isOver(status: GameStatus): boolean {
  return (
    status === GameStatus.Checkmate ||
    status === GameStatus.KingCaptured ||
    status === GameStatus.Draw
  );
}

/** All the state of one game, and the actions that change it. */
export function useGame({ createGame, usesDice = false }: Variant) {
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

  // Dice Chess waits for the player to press Start before the first roll.
  const [started, setStarted] = useState(!usesDice);
  // Dice Chess only: this turn's rolled dice (empty in every other variant,
  // and before the game has started).
  const [dice, setDice] = useState<Die[]>([]);
  // Counts the rolls, so the dice can play their rolling animation for each.
  const [rollId, setRollId] = useState(0);

  function rollForNextTurn() {
    setDice(rollTurnDice(true));
    setRollId((id) => id + 1);
  }

  const { status, drawReason } = usesDice
    ? getDiceOutcome(board, turn, history)
    : getGameOutcome(board, turn, history, context);

  // The moves the remaining dice allow. Players must use as many dice as they
  // can, so this is only the moves that keep the most dice playable.
  const diceMoves = useMemo<DiceMove[]>(
    () =>
      usesDice && started && !isOver(status)
        ? getDiceMoves(board, context, turn, unusedTypes(dice))
        : [],
    [usesDice, started, board, context, turn, dice, status],
  );

  const isGameOver = isOver(status);
  // With dice and no piece able to move, the player simply passes.
  const mustPass =
    usesDice && started && !isGameOver && diceMoves.length === 0;

  /** May the player make this move right now? */
  function isAllowed(move: Move): boolean {
    return usesDice
      ? diceMoves.some((diceMove) => isSameMove(diceMove.move, move))
      : isValidTarget(board, move, context);
  }

  /** Is there a piece on `square` that the player to move is able to move? */
  function canPickUp(square: Square): boolean {
    return (
      !isGameOver &&
      started &&
      !pendingPromotion &&
      getPiece(board, square)?.color === turn &&
      (usesDice
        ? diceMoves.some((diceMove) => isSameSquare(diceMove.move.from, square))
        : canThePieceMove(board, square, context))
    );
  }

  // The pieces the pending promotion may become. In Dice Chess only those
  // that still let the most dice be played.
  const promotionChoices =
    usesDice && pendingPromotion
      ? diceMoves
          .filter((diceMove) => isSameMove(diceMove.move, pendingPromotion))
          .flatMap((diceMove) => (diceMove.promotion ? [diceMove.promotion] : []))
      : undefined;

  // Plays the move and hands the turn to the other player. In Dice Chess the
  // turn stays put while dice are left that can still be played.
  function playMove(move: Move, promotion?: PieceType) {
    const result = applyMove(board, move, context, promotion);
    let nextTurn = getOpponent(turn);
    let nextContext = updateMoveContext(context, board, move);

    if (usesDice) {
      const played = getPiece(board, move.from)?.type;
      const usedIndex = dice.findIndex((d) => !d.used && d.type === played);
      const nextDice = dice.map((die, i) =>
        i === usedIndex ? { ...die, used: true } : die,
      );
      const left = unusedTypes(nextDice);
      const sameTurn = continueTurn(board, context, {
        move,
        promotion: promotion ?? null,
      });
      const hasMoreToPlay =
        left.length > 0 &&
        result.captured?.type !== PieceType.King &&
        getDiceMoves(sameTurn.board, sameTurn.context, turn, left).length > 0;

      if (hasMoreToPlay) {
        nextTurn = turn;
        nextContext = sameTurn.context;
        setDice(nextDice);
      } else {
        rollForNextTurn();
      }
    }

    setBoard(result.board);
    setTurn(nextTurn);
    setContext(nextContext);
    setHistory(recordMove(history, board, move, result, nextTurn, nextContext));
    setSelected(null);
    setPendingPromotion(null);
  }

  // Dice Chess: the first roll, which begins the game.
  function startGame() {
    setStarted(true);
    rollForNextTurn();
  }

  // Dice Chess: no die can be played, so the turn goes to the opponent.
  function passTurn() {
    const nextTurn = getOpponent(turn);
    const nextContext = { ...context, enPassantTarget: null };

    setTurn(nextTurn);
    setContext(nextContext);
    setHistory(recordPass(history, board, nextTurn, nextContext));
    rollForNextTurn();
    setSelected(null);
  }

  // Show the useless roll for a moment, then pass and roll for the opponent.
  useEffect(() => {
    if (!mustPass) return;
    const timer = setTimeout(passTurn, PASS_DELAY_MS);
    return () => clearTimeout(timer);
    // The position only changes with `dice`, which changes with every roll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustPass, dice]);

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
      if (isAllowed(move)) requestMove(move);
    }
  }

  // Drag-to-move: the piece is dropped on `to`, or off the board (null),
  // in which case it simply stays where it was.
  function dropPiece(from: Square, to: Square | null) {
    if (!to || !canPickUp(from)) return;

    const move = { from, to };
    if (isAllowed(move)) requestMove(move);
  }

  function newGame() {
    const { board: startingBoard, context: startingContext } = createGame();

    setBoard(startingBoard);
    setSelected(null);
    setPendingPromotion(null);
    setTurn(Color.White);
    setContext(startingContext);
    setHistory(createHistory(startingBoard, Color.White, startingContext));
    // Only the very first game waits for Start; later ones roll right away.
    setStarted(true);
    setDice(rollTurnDice(usesDice));
    setRollId((id) => id + 1);
  }

  return {
    board,
    selected,
    turn,
    status,
    drawReason,
    isGameOver,
    isPromoting: pendingPromotion !== null,
    promotionChoices,
    dice,
    rollId,
    started,
    startGame,
    canPickUp,
    selectSquare,
    dropPiece,
    completePromotion,
    cancelPromotion,
    newGame,
  };
}
