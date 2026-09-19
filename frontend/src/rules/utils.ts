import type { Board, MoveResult, Square } from "@/components/Board/types";
import {
  getAllSquares,
  getPiece,
  isLightSquare,
  movePiece,
} from "@/components/Board/utils";
import { Color, PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import { FIFTY_MOVE_HALFMOVES, REPETITION_LIMIT } from "./constants";
import { PIECE_RULES } from "./pieces";
import {
  DrawReason,
  GameStatus,
  type GameHistory,
  type GameOutcome,
  type PieceRule,
  type SquareTest,
} from "./types";

export function fileDistance(from: Square, to: Square): number {
  return Math.abs(to.file - from.file);
}

export function rankDistance(from: Square, to: Square): number {
  return Math.abs(to.rank - from.rank);
}

export function isDiagonal(from: Square, to: Square): boolean {
  return (
    from.file !== to.file && fileDistance(from, to) === rankDistance(from, to)
  );
}

/** Same file or same rank, but not both (that would be the same square). */
export function isStraight(from: Square, to: Square): boolean {
  return (from.file === to.file) !== (from.rank === to.rank);
}

/** Are all squares strictly between `from` and `to` empty? They must be in line. */
export function isPathClear(board: Board, from: Square, to: Square): boolean {
  const stepFile = Math.sign(to.file - from.file);
  const stepRank = Math.sign(to.rank - from.rank);
  let file = from.file + stepFile;
  let rank = from.rank + stepRank;

  while (file !== to.file || rank !== to.rank) {
    if (getPiece(board, { file, rank })) return false;
    file += stepFile;
    rank += stepRank;
  }
  return true;
}

/**
 * For every piece except the pawn, moving and capturing work the same way:
 * it may go anywhere it attacks, unless one of its own pieces is there.
 */
export function createRule(attacks: SquareTest): PieceRule {
  return {
    attacks,
    isValidTarget: (board, from, to) =>
      attacks(board, from, to) &&
      getPiece(board, to)?.color !== getPiece(board, from)?.color,
  };
}

/**
 * Can the piece on `from` move at all? False when it has no valid target:
 * it is blocked in, pinned against its king, or (for the king) every
 * square around it is attacked or occupied.
 */
export function canThePieceMove(board: Board, from: Square): boolean {
  return getAllSquares().some((to) => isValidTarget(board, from, to));
}

/** Is `square` attacked by any piece of colour `by`? */
export function isSquareAttacked(
  board: Board,
  square: Square,
  by: Color,
): boolean {
  return getAllSquares().some((from) => {
    const piece = getPiece(board, from);
    return (
      piece?.color === by &&
      PIECE_RULES[piece.type].attacks(board, from, square)
    );
  });
}

export function findKing(board: Board, color: Color): Square | null {
  return (
    getAllSquares().find((square) => {
      const piece = getPiece(board, square);
      return piece?.type === PieceType.King && piece.color === color;
    }) ?? null
  );
}

export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  return king !== null && isSquareAttacked(board, king, getOpponent(color));
}

/**
 * Can the piece on `from` move to `to`? It must follow its own movement
 * rules (including captures), and the move must not leave its own king in
 * check. That second part is what keeps a pinned piece on its line, and
 * stops the king from stepping onto an attacked square.
 */
export function isValidTarget(board: Board, from: Square, to: Square): boolean {
  const piece = getPiece(board, from);
  if (!piece || !PIECE_RULES[piece.type].isValidTarget(board, from, to)) {
    return false;
  }

  return !isInCheck(movePiece(board, from, to).board, piece.color);
}

/** Does `color` have at least one piece that can move? */
function hasAnyMove(board: Board, color: Color): boolean {
  return getAllSquares().some(
    (square) =>
      getPiece(board, square)?.color === color &&
      canThePieceMove(board, square),
  );
}

/**
 * A string that is equal for two positions exactly when they count as the
 * same for repetition. TODO: castling rights and the en passant square must
 * join the key once those rules exist.
 */
function getPositionKey(board: Board, turn: Color): string {
  const cells = board
    .flat()
    .map((piece) => (piece ? `${piece.color[0]}${piece.type}` : "-"));
  return `${turn} ${cells.join(",")}`;
}

export function createHistory(board: Board, turn: Color): GameHistory {
  return { halfmoveClock: 0, positionKeys: [getPositionKey(board, turn)] };
}

/**
 * The history after the piece on `from` made `result` (a move from `before`),
 * leaving `turn` to move. A pawn move or capture can never be undone, so it
 * restarts both the clock and the list of positions.
 */
export function recordMove(
  history: GameHistory,
  before: Board,
  from: Square,
  result: MoveResult,
  turn: Color,
): GameHistory {
  const key = getPositionKey(result.board, turn);
  const isIrreversible =
    getPiece(before, from)?.type === PieceType.Pawn || result.captured !== null;

  return isIrreversible
    ? { halfmoveClock: 0, positionKeys: [key] }
    : {
        halfmoveClock: history.halfmoveClock + 1,
        positionKeys: [...history.positionKeys, key],
      };
}

/**
 * Neither side could ever checkmate: bare kings, a lone knight or bishop,
 * or only bishops that all stand on the same colour of square.
 */
function hasInsufficientMaterial(board: Board): boolean {
  const pieces = getAllSquares().flatMap((square) => {
    const piece = getPiece(board, square);
    return piece && piece.type !== PieceType.King ? [{ piece, square }] : [];
  });

  if (pieces.length === 0) return true;
  if (pieces.every(({ piece }) => piece.type === PieceType.Bishop)) {
    return (
      new Set(pieces.map(({ square }) => isLightSquare(square))).size === 1
    );
  }
  return pieces.length === 1 && pieces[0].piece.type === PieceType.Knight;
}

/** The draw that applies while the player to move still has moves, if any. */
function getDrawReason(
  board: Board,
  turn: Color,
  history: GameHistory,
): DrawReason | null {
  if (hasInsufficientMaterial(board)) return DrawReason.InsufficientMaterial;
  if (history.halfmoveClock >= FIFTY_MOVE_HALFMOVES) {
    return DrawReason.FiftyMoveRule;
  }

  const key = getPositionKey(board, turn);
  const occurrences = history.positionKeys.filter((k) => k === key).length;
  return occurrences >= REPETITION_LIMIT
    ? DrawReason.ThreefoldRepetition
    : null;
}

/** Where the game stands for the player about to move (`turn`). */
export function getGameOutcome(
  board: Board,
  turn: Color,
  history: GameHistory,
): GameOutcome {
  const inCheck = isInCheck(board, turn);
  const canMove = hasAnyMove(board, turn);

  // Checkmate outranks every draw rule, even one that also applies.
  if (!canMove && inCheck) {
    return { status: GameStatus.Checkmate, drawReason: null };
  }

  const drawReason = canMove
    ? getDrawReason(board, turn, history)
    : DrawReason.Stalemate;
  if (drawReason) return { status: GameStatus.Draw, drawReason };

  return {
    status: inCheck ? GameStatus.Check : GameStatus.Playing,
    drawReason: null,
  };
}
