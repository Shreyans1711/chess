import type { Board, Move, Square } from "@/components/Board/types";
import type { Color, PieceType } from "@/components/Piece/types";

/** Answers a yes/no question about a move by the piece standing on `from`. */
export type MoveTest = (board: Board, move: Move) => boolean;

/** The movement rules of one kind of piece. */
export type PieceRule = {
  /**
   * Would this piece capture an enemy standing on `to`? Used to detect
   * check, so it ignores who (if anyone) is on `to`.
   */
  attacks: MoveTest;
  /** Can this piece move to `to`, by its own movement rules only? */
  isValidTarget: (board: Board, move: Move, context: MoveContext) => boolean;
};

/** Which side of the board a king castles towards. */
export enum CastlingSide {
  KingSide = "kingSide",
  QueenSide = "queenSide",
}

/**
 * Who may still castle, and on which side. A right is lost for good once the
 * king, or that side's rook, moves (or the rook is captured).
 */
export type CastlingRights = Record<Color, Record<CastlingSide, boolean>>;

export type CastlingFiles = {
  king: number;
  rooks: Record<CastlingSide, number>;
};

/**
 * What a move's legality depends on besides the pieces on the board: the
 * special moves that need to remember the past.
 */
export type MoveContext = {
  castlingRights: CastlingRights;
  /**
   * The files the king and each castling rook start on. Fixed for the whole
   * game: e, a and h in standard chess, but different in every Chess960 game.
   */
  castlingFiles: CastlingFiles;
  /**
   * The square a pawn just skipped over with a two-square push (e3 after
   * e2-e4), where an enemy pawn may capture it en passant. It only lasts for
   * the very next move, so it is null otherwise.
   */
  enPassantTarget: Square | null;
};

/** Which way a pawn advances along the ranks. */
export enum PawnDirection {
  Up = 1,
  Down = -1,
}

/** The zero-based rank a side's pawns start on. */
export enum PawnStartRank {
  White = 1,
  Black = 6,
}

export enum GameStatus {
  Playing = "playing",
  Check = "check",
  Checkmate = "checkmate",
  /** Dice Chess: a king was taken. The player to move is the one who lost. */
  KingCaptured = "kingCaptured",
  Draw = "draw",
}

/** Why a game ended in a draw. Stalemate is a draw, not a separate result. */
export enum DrawReason {
  Stalemate = "stalemate",
  FiftyMoveRule = "the fifty-move rule",
  ThreefoldRepetition = "threefold repetition",
  InsufficientMaterial = "insufficient material",
}

/** How a game stands: `drawReason` is set exactly when `status` is Draw. */
export type GameOutcome = {
  status: GameStatus;
  drawReason: DrawReason | null;
};

/** What the draw rules need to remember about the moves played so far. */
export type GameHistory = {
  /** Moves since the last pawn move or capture, counting each side's move. */
  halfmoveClock: number;
  /**
   * Keys of the positions reached since the last pawn move or capture (a
   * position cannot repeat across one). The last key is the current position.
   */
  positionKeys: string[];
};

/** A move in Dice Chess, with the piece a pawn promotes to (null if none). */
export type DiceMove = {
  move: Move;
  promotion: PieceType | null;
};

/** One rolled die: the piece it allows to move, and whether it was played. */
export type Die = {
  type: PieceType;
  used: boolean;
};
