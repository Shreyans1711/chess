import { createStartingBoard } from "@/components/Board/utils";
import { STANDARD_BACK_RANK } from "@/components/Piece/constants";
import { createMoveContext } from "@/rules/utils";
import type { NewGame } from "./types";

// TODO: Stack Chess. For now this is the standard game, so the route works
// while the rules are written.
export function createStackChessGame(): NewGame {
  return {
    board: createStartingBoard(STANDARD_BACK_RANK),
    context: createMoveContext(STANDARD_BACK_RANK),
  };
}
