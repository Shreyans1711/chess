import { createRule, isPathClear, isStraight } from "../utils";

export const rookRule = createRule(
  (board, from, to) => isStraight(from, to) && isPathClear(board, from, to),
);
