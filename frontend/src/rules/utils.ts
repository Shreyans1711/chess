import type { Board, Move, MoveResult, Square } from "@/components/Board/types";
import {
  getAllSquares,
  getPiece,
  isLightSquare,
  isSameSquare,
  movePiece,
  setPiece,
  squareName,
} from "@/components/Board/utils";
import { Color, PieceType } from "@/components/Piece/types";
import { getOpponent } from "@/components/Piece/utils";
import {
  BACK_RANK,
  FIFTY_MOVE_HALFMOVES,
  PROMOTION_RANK,
  REPETITION_LIMIT,
  KING_CASTLE_FILE,
  ROOK_CASTLE_FILE,
} from "./constants";
import { PIECE_RULES } from "./pieceRules";
import {
  CastlingSide,
  DrawReason,
  GameStatus,
  type CastlingRights,
  type GameHistory,
  type CastlingFiles,
  type GameOutcome,
  type MoveContext,
  type MoveTest,
  type PieceRule,
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
export function createRule(attacks: MoveTest): PieceRule {
  return {
    attacks,
    isValidTarget: (board, move) =>
      attacks(board, move) &&
      getPiece(board, move.to)?.color !== getPiece(board, move.from)?.color,
  };
}

/**
 * Can the piece on `from` move at all? False when it has no valid target:
 * it is blocked in, pinned against its king, or (for the king) every
 * square around it is attacked or occupied.
 */
export function canThePieceMove(
  board: Board,
  from: Square,
  context: MoveContext,
): boolean {
  return getAllSquares().some((to) =>
    isValidTarget(board, { from, to }, context),
  );
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
      PIECE_RULES[piece.type].attacks(board, { from, to: square })
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
export function isValidTarget(
  board: Board,
  move: Move,
  context: MoveContext,
): boolean {
  const piece = getPiece(board, move.from);
  if (!piece || !PIECE_RULES[piece.type].isValidTarget(board, move, context)) {
    return false;
  }

  return !isInCheck(applyMove(board, move, context).board, piece.color);
}

/** Would this move take a pawn to the last rank? */
export function isPromotionMove(board: Board, { from, to }: Move): boolean {
  const piece = getPiece(board, from);
  return (
    piece?.type === PieceType.Pawn && to.rank === PROMOTION_RANK[piece.color]
  );
}

/**
 * Plays the move on a copy of the board. This is `movePiece`, plus the moves
 * that change more than the piece itself:
 * - castling: the king and its rook both land on their castled squares;
 * - en passant (a pawn stepping diagonally onto an empty square): the pawn it
 *   passed is removed, and reported as `captured`;
 * - promotion (a pawn reaching the last rank): pass `promotion` and the
 *   pawn becomes that piece.
 */
export function applyMove(
  board: Board,
  move: Move,
  context: MoveContext,
  promotion?: PieceType,
): MoveResult {
  const { from, to } = move;
  const piece = getPiece(board, from);
  if (!piece) return movePiece(board, move);

  const side = getCastlingSide(board, move, context);
  if (side) {
    const rookFrom = {
      file: context.castlingFiles.rooks[side],
      rank: from.rank,
    };
    const kingTo = { file: KING_CASTLE_FILE[side], rank: from.rank };
    const rookTo = { file: ROOK_CASTLE_FILE[side], rank: from.rank };
    // Lift both pieces first: in Chess960 a destination can be where the
    // other piece stands.
    let castled = setPiece(setPiece(board, from, null), rookFrom, null);
    castled = setPiece(castled, kingTo, piece);
    castled = setPiece(castled, rookTo, getPiece(board, rookFrom));
    return { board: castled, captured: null };
  }

  const result = movePiece(board, move);

  let newBoard = result.board;
  let captured = result.captured;

  if (
    piece.type === PieceType.Pawn &&
    from.file !== to.file &&
    !getPiece(board, to)
  ) {
    const passedPawn = { file: to.file, rank: from.rank };
    captured = getPiece(board, passedPawn);
    newBoard = setPiece(newBoard, passedPawn, null);
  }

  if (promotion) {
    newBoard = setPiece(newBoard, to, { type: promotion, color: piece.color });
  }

  return { board: newBoard, captured };
}

/**
 * The castling rights that remain after a move from `from` to `to`. A right
 * goes when its king moves, or when anything moves from or onto its rook's
 * home square (the rook moved, or was captured there).
 */
function updateCastlingRights(
  castlingRights: CastlingRights,
  castlingFiles: CastlingFiles,
  before: Board,
  { from, to }: Move,
): CastlingRights {
  const mover = getPiece(before, from);

  function remainingRights(color: Color): Record<CastlingSide, boolean> {
    const kingMoved = mover?.type === PieceType.King && mover.color === color;

    function isKept(side: CastlingSide): boolean {
      const rookHome = {
        file: castlingFiles.rooks[side],
        rank: BACK_RANK[color],
      };
      return (
        castlingRights[color][side] &&
        !kingMoved &&
        !isSameSquare(from, rookHome) &&
        !isSameSquare(to, rookHome)
      );
    }

    return {
      [CastlingSide.KingSide]: isKept(CastlingSide.KingSide),
      [CastlingSide.QueenSide]: isKept(CastlingSide.QueenSide),
    };
  }

  return {
    [Color.White]: remainingRights(Color.White),
    [Color.Black]: remainingRights(Color.Black),
  };
}

/**
 * The square a pawn skips over when it advances two ranks (e3 for e2-e4),
 * which an enemy pawn may capture on the very next move. Null for any other
 * move.
 */
function getEnPassantTarget(before: Board, { from, to }: Move): Square | null {
  const isDoublePush =
    getPiece(before, from)?.type === PieceType.Pawn &&
    rankDistance(from, to) === 2;

  return isDoublePush
    ? { file: from.file, rank: (from.rank + to.rank) / 2 }
    : null;
}

/** The special-move state after `move` was played from the `before` board. */
export function updateMoveContext(
  context: MoveContext,
  before: Board,
  move: Move,
): MoveContext {
  return {
    castlingRights: updateCastlingRights(
      context.castlingRights,
      context.castlingFiles,
      before,
      move,
    ),
    castlingFiles: context.castlingFiles,
    enPassantTarget: getEnPassantTarget(before, move),
  };
}

/**
 * The special-move state at the start of a game whose back rank is laid out
 * as `backRank` (a-file to h-file): everyone may castle either way, with the
 * rooks on either side of the king.
 */
export function createMoveContext(backRank: readonly PieceType[]): MoveContext {
  const allSides = {
    [CastlingSide.KingSide]: true,
    [CastlingSide.QueenSide]: true,
  };

  return {
    castlingRights: { [Color.White]: allSides, [Color.Black]: allSides },
    castlingFiles: {
      king: backRank.indexOf(PieceType.King),
      rooks: {
        [CastlingSide.QueenSide]: backRank.indexOf(PieceType.Rook),
        [CastlingSide.KingSide]: backRank.lastIndexOf(PieceType.Rook),
      },
    },
    enPassantTarget: null,
  };
}

/**
 * Is this king move shaped like castling, and towards which side? It is when
 * the king, still on its start file, moves onto its own castling rook, or two
 * or more files to where it lands after castling. Whether castling is
 * actually allowed is up to the king's rule.
 */
export function getCastlingSide(
  board: Board,
  { from, to }: Move,
  context: MoveContext,
): CastlingSide | null {
  const king = getPiece(board, from);
  const { castlingFiles } = context;
  if (king?.type !== PieceType.King) return null;
  if (from.rank !== BACK_RANK[king.color] || to.rank !== from.rank) return null;
  if (from.file !== castlingFiles.king) return null;

  const target = getPiece(board, to);
  const isOwnRook =
    target?.type === PieceType.Rook && target.color === king.color;

  return (
    Object.values(CastlingSide).find(
      (side) =>
        (isOwnRook && to.file === castlingFiles.rooks[side]) ||
        (to.file === KING_CASTLE_FILE[side] && fileDistance(from, to) >= 2),
    ) ?? null
  );
}

/** Does `color` have at least one piece that can move? */
function hasAnyMove(board: Board, color: Color, context: MoveContext): boolean {
  return getAllSquares().some(
    (square) =>
      getPiece(board, square)?.color === color &&
      canThePieceMove(board, square, context),
  );
}

/**
 * A string that is equal for two positions exactly when they count as the
 * same for repetition. The en passant square counts even when no pawn can
 * actually use it, so a position reached right after a two-square push is
 * never treated as a repeat of one reached any other way (a small deviation
 * from the official rule: it can only delay a repetition draw, never cause one).
 */
function getPositionKey(
  board: Board,
  turn: Color,
  context: MoveContext,
): string {
  const cells = board
    .flat()
    .map((piece) => (piece ? `${piece.color[0]}${piece.type}` : "-"));
  const rights = Object.values(context.castlingRights)
    .flatMap((sides) => Object.values(sides))
    .map(Number);
  const enPassant = context.enPassantTarget
    ? squareName(context.enPassantTarget)
    : "-";
  return `${turn} ${cells.join(",")} ${rights.join("")} ${enPassant}`;
}

export function createHistory(
  board: Board,
  turn: Color,
  context: MoveContext,
): GameHistory {
  return {
    halfmoveClock: 0,
    positionKeys: [getPositionKey(board, turn, context)],
  };
}

/**
 * The history after `move` (played from the `before` board) produced `result`,
 * leaving `turn` to move, with `context` as the new special-move state. A pawn
 * move or capture can never be undone, so it restarts both the clock and the
 * list of positions.
 */
export function recordMove(
  history: GameHistory,
  before: Board,
  move: Move,
  result: MoveResult,
  turn: Color,
  context: MoveContext,
): GameHistory {
  const key = getPositionKey(result.board, turn, context);
  const isIrreversible =
    getPiece(before, move.from)?.type === PieceType.Pawn ||
    result.captured !== null;

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
function getDrawReason(board: Board, history: GameHistory): DrawReason | null {
  if (hasInsufficientMaterial(board)) return DrawReason.InsufficientMaterial;
  if (history.halfmoveClock >= FIFTY_MOVE_HALFMOVES) {
    return DrawReason.FiftyMoveRule;
  }

  // The last key is always the current position.
  const key = history.positionKeys[history.positionKeys.length - 1];
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
  context: MoveContext,
): GameOutcome {
  const inCheck = isInCheck(board, turn);
  const canMove = hasAnyMove(board, turn, context);

  // Checkmate outranks every draw rule, even one that also applies.
  if (!canMove && inCheck) {
    return { status: GameStatus.Checkmate, drawReason: null };
  }

  const drawReason = canMove
    ? getDrawReason(board, history)
    : DrawReason.Stalemate;
  if (drawReason) return { status: GameStatus.Draw, drawReason };

  return {
    status: inCheck ? GameStatus.Check : GameStatus.Playing,
    drawReason: null,
  };
}
