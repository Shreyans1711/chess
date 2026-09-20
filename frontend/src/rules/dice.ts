import type { Board, Move } from "@/components/Board/types";
import { getAllSquares, getPiece } from "@/components/Board/utils";
import type { Color } from "@/components/Piece/types";
import { PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { PROMOTION_TYPES } from "./constants";
import { PIECE_RULES } from "./pieceRules";
import {
  GameStatus,
  type DiceMove,
  type GameHistory,
  type GameOutcome,
  type MoveContext,
} from "./types";
import {
  applyMove,
  findKing,
  getDrawReason,
  isPromotionMove,
  updateMoveContext,
} from "./utils";

/** How many dice a player rolls at the start of a turn. */
export const DICE_COUNT = 3;

export const DIE_FACES: readonly PieceType[] = [
  PieceType.Pawn,
  PieceType.Knight,
  PieceType.Bishop,
  PieceType.Rook,
  PieceType.Queen,
  PieceType.King,
];

export function rollDice(): PieceType[] {
  return Array.from(
    { length: DICE_COUNT },
    () => DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)],
  );
}

/** `dice` without one die of the given type. */
export function removeDie(dice: PieceType[], type: PieceType): PieceType[] {
  const index = dice.indexOf(type);
  return index === -1 ? dice : dice.filter((_, i) => i !== index);
}

/**
 * Every move a piece of the given type may make by its movement rules alone.
 * There is no check in Dice Chess: a king may step into an attack, and the
 * game is won by capturing the enemy king.
 */
function getMovesForDie(
  board: Board,
  context: MoveContext,
  color: Color,
  type: PieceType,
): DiceMove[] {
  const squares = getAllSquares();

  return squares
    .filter((from) => {
      const piece = getPiece(board, from);
      return piece?.color === color && piece.type === type;
    })
    .flatMap((from) =>
      squares.flatMap((to): DiceMove[] => {
        const move: Move = { from, to };
        const piece = getPiece(board, from);
        if (
          !piece ||
          !PIECE_RULES[piece.type].isValidTarget(board, move, context)
        ) {
          return [];
        }
        return isPromotionMove(board, move)
          ? PROMOTION_TYPES.map((promotion) => ({ move, promotion }))
          : [{ move, promotion: null }];
      }),
    );
}

/**
 * The position after a move that does not end the turn. The en passant
 * square is dropped: it is only there for the opponent's move.
 */
export function continueTurn(
  board: Board,
  context: MoveContext,
  { move, promotion }: DiceMove,
) {
  return {
    board: applyMove(board, move, context, promotion ?? undefined).board,
    context: {
      ...updateMoveContext(context, board, move),
      enPassantTarget: null,
    },
  };
}

/** Was the enemy king just taken? That ends the game on the spot. */
function isKingTaken(board: Board, color: Color): boolean {
  return findKing(board, getOpponent(color)) === null;
}

/**
 * The most dice that can be played in a row from this position. Taking the
 * king wins the game, so it counts as playing every die and is always the
 * move to make.
 */
function countPlayableDice(
  board: Board,
  context: MoveContext,
  color: Color,
  dice: PieceType[],
): number {
  let best = 0;

  for (const type of new Set(dice)) {
    const rest = removeDie(dice, type);
    for (const diceMove of getMovesForDie(board, context, color, type)) {
      const next = continueTurn(board, context, diceMove);
      best = Math.max(
        best,
        isKingTaken(next.board, color)
          ? dice.length
          : 1 + countPlayableDice(next.board, next.context, color, rest),
      );
      if (best === dice.length) return best;
    }
  }
  return best;
}

/**
 * The moves the player may start with. A player must use as many dice as
 * possible, so only the moves that still allow the most dice to be played are
 * offered: with a pawn and two rooks at the start, only a pawn move that frees
 * a rook qualifies. Empty when no die can be played.
 */
export function getDiceMoves(
  board: Board,
  context: MoveContext,
  color: Color,
  dice: PieceType[],
): DiceMove[] {
  const candidates = [...new Set(dice)].flatMap((type) => {
    const rest = removeDie(dice, type);
    return getMovesForDie(board, context, color, type).map((diceMove) => {
      const next = continueTurn(board, context, diceMove);
      return {
        diceMove,
        used: isKingTaken(next.board, color)
          ? dice.length
          : 1 + countPlayableDice(next.board, next.context, color, rest),
      };
    });
  });

  const most = Math.max(0, ...candidates.map(({ used }) => used));
  return candidates
    .filter(({ used }) => used === most)
    .map(({ diceMove }) => diceMove);
}

/**
 * Where a Dice Chess game stands for the player about to move. There is no
 * checkmate or stalemate: the game ends when a king is captured (the player to
 * move is the one who lost it), or in a draw by the fifty-move rule or
 * threefold repetition.
 */
export function getDiceOutcome(
  board: Board,
  turn: Color,
  history: GameHistory,
): GameOutcome {
  if (findKing(board, turn) === null) {
    return { status: GameStatus.KingCaptured, drawReason: null };
  }

  const drawReason = getDrawReason(board, history, {
    insufficientMaterial: false,
  });
  return drawReason
    ? { status: GameStatus.Draw, drawReason }
    : { status: GameStatus.Playing, drawReason: null };
}
