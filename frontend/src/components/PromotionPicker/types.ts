import type { Color, PieceType } from "@/components/Piece/types";

export type PromotionPickerProps = {
  /** The colour of the pawn being promoted, so the choices match it. */
  color: Color;
  onSelect: (type: PieceType) => void;
  /** Called when the player clicks away without choosing. */
  onCancel: () => void;
};
