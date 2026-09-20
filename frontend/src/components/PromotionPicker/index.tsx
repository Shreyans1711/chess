import { Piece } from "@/components/Piece";
import { PROMOTION_TYPES } from "@/rules/constants";
import styles from "./styles.module.scss";
import type { PromotionPickerProps } from "./types";

/** Covers the board with the pieces a pawn can promote to. */
export function PromotionPicker({
  color,
  types = PROMOTION_TYPES,
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.card}
        role="dialog"
        aria-label="Choose a piece to promote to"
        // Clicking a choice must not count as clicking away.
        onClick={(event) => event.stopPropagation()}
      >
        {types.map((type) => (
          <button
            key={type}
            type="button"
            className={styles.choice}
            aria-label={`Promote to ${type}`}
            onClick={() => onSelect(type)}
          >
            <Piece piece={{ type, color }} />
          </button>
        ))}
      </div>
    </div>
  );
}
