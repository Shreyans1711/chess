import { createRule, fileDistance, rankDistance } from "../utils";

// Castling is not implemented yet. Moving into check is rejected separately,
// for every piece, by isValidTarget.
export const kingRule = createRule(
  (_board, from, to) =>
    Math.max(fileDistance(from, to), rankDistance(from, to)) === 1,
);
