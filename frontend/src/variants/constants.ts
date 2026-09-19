import { createStartingBoard } from "@/components/Board/utils";
import { STANDARD_BACK_RANK } from "@/components/Piece/constants";
import type { PieceType } from "@/components/Piece/types";
import { createMoveContext } from "@/rules/utils";
import { createChess960BackRank } from "./chess960";
import type { NewGame, Variant } from "./types";

function createGameFrom(backRank: readonly PieceType[]): NewGame {
  return {
    board: createStartingBoard(backRank),
    context: createMoveContext(backRank),
  };
}

const createStandardGame = () => createGameFrom(STANDARD_BACK_RANK);

// Add a game here and it gets its route and its sidebar link. Slots 3-10 are
// placeholders for the standard game.
export const VARIANTS: Variant[] = [
  { 
    slug: "original", 
    name: "Original", 
    createGame: createStandardGame 
  },
  {
    slug: "chess960",
    name: "Chess960",
    createGame: () => createGameFrom(createChess960BackRank()),
  },
  ...[3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
    slug: `variant-${n}`,
    name: "Original",
    createGame: createStandardGame,
  })),
];
