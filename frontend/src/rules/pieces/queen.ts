import { createRule, isDiagonal, isPathClear, isStraight } from "../utils";

export const queenRule = createRule(
  (board, from, to) =>
    (isDiagonal(from, to) || isStraight(from, to)) &&
    isPathClear(board, from, to),
);
