// String values (not numbers) because Color and PieceType are also used to
// build the SCSS class names (.white-knight) and the screen-reader labels.
export enum Color {
  White = "white",
  Black = "black",
}

export enum PieceType {
  Pawn = "pawn",
  Knight = "knight",
  Bishop = "bishop",
  Rook = "rook",
  Queen = "queen",
  King = "king",
}

export type Piece = {
  type: PieceType;
  color: Color;
};

export type PieceProps = {
  piece: Piece;
};
