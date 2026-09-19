import { createRule, isDiagonal, isPathClear } from "../utils";

export const bishopRule = createRule(
  (board, { from, to }) => isDiagonal(from, to) && isPathClear(board, from, to),
);
