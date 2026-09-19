import { createRule, fileDistance, rankDistance } from "../utils";

export const knightRule = createRule((_board, from, to) => {
  const files = fileDistance(from, to);
  const ranks = rankDistance(from, to);
  return (files === 1 && ranks === 2) || (files === 2 && ranks === 1);
});
