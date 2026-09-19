export const BOARD_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7];

export const FILE_NAMES = "abcdefgh";

// The DOM draws top-to-bottom, but rank 8 is at the top of the board,
// so we walk ranks from 7 down to 0.
export const RANKS_TOP_TO_BOTTOM = [...BOARD_INDEXES].reverse();
