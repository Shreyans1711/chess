"use client";

import type { PointerEvent } from "react";
import { DragGhost } from "@/components/DragGhost";
import { GameOver } from "@/components/GameOver";
import { GameStatus } from "@/components/GameStatus";
import { NewGameButton } from "@/components/NewGameButton";
import { Piece } from "@/components/Piece";
import { PromotionPicker } from "@/components/PromotionPicker";
import { useGame } from "@/hooks/useGame";
import { usePieceDrag } from "@/hooks/usePieceDrag";
import { BOARD_INDEXES, RANKS_TOP_TO_BOTTOM } from "./constants";
import styles from "./styles.module.scss";
import type { BoardProps, Square } from "./types";
import {
  fileName,
  getPiece,
  isLightSquare,
  isSquare,
  rankName,
  squareName,
} from "./utils";

/** Owns the game state and lays out the board with its side panel. */
export function Board({ variant }: BoardProps) {
  const {
    board,
    selected,
    turn,
    status,
    drawReason,
    isGameOver,
    isPromoting,
    canPickUp,
    selectSquare,
    dropPiece,
    completePromotion,
    cancelPromotion,
    newGame,
  } = useGame(variant);
  const { drag, startDrag } = usePieceDrag(dropPiece);

  function handleSquarePointerDown(
    square: Square,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    const piece = getPiece(board, square);
    // Left mouse button (or touch / pen) on a piece of the side to move only.
    if (!piece || !canPickUp(square) || event.button !== 0) return;

    startDrag({
      from: square,
      piece,
      x: event.clientX,
      y: event.clientY,
      size: event.currentTarget.getBoundingClientRect().width,
    });
  }

  // Only treat it as a drag once the pointer has really moved.
  const activeDrag = drag?.moved ? drag : null;
  const dragFrom = activeDrag?.from ?? null;

  return (
    <div className={styles.game}>
      <div className={styles.boardArea}>
        <div className={styles.board}>
          {RANKS_TOP_TO_BOTTOM.flatMap((rank) =>
            BOARD_INDEXES.map((file) => {
              const square = { file, rank };
              const piece = getPiece(board, square);
              const isPieceHidden = isSquare(dragFrom, square);
              const isSelected = isSquare(selected, square) || isPieceHidden;
              const shade = isLightSquare(square) ? styles.light : styles.dark;

              return (
                <button
                  key={squareName(square)}
                  type="button"
                  className={`${styles.square} ${shade} ${isSelected ? styles.selected : ""}`}
                  aria-label={squareName(square)}
                  aria-pressed={isSelected}
                  // Read back by usePieceDrag to find the square under the pointer.
                  data-file={file}
                  data-rank={rank}
                  onClick={() => selectSquare(square)}
                  onPointerDown={(event) =>
                    handleSquarePointerDown(square, event)
                  }
                >
                  {file === 0 && (
                    <span className={`${styles.label} ${styles.rank}`}>
                      {rankName(rank)}
                    </span>
                  )}
                  {rank === 0 && (
                    <span className={`${styles.label} ${styles.file}`}>
                      {fileName(file)}
                    </span>
                  )}
                  {piece && !isPieceHidden && <Piece piece={piece} />}
                </button>
              );
            }),
          )}
          {isPromoting && (
            <PromotionPicker
              color={turn}
              onSelect={completePromotion}
              onCancel={cancelPromotion}
            />
          )}
          {isGameOver && (
            <GameOver
              status={status}
              drawReason={drawReason}
              turn={turn}
              onNewGame={newGame}
            />
          )}
        </div>
      </div>

      <aside className={styles.side}>
        <GameStatus status={status} drawReason={drawReason} turn={turn} />
        <NewGameButton onClick={newGame} />
      </aside>

      {activeDrag && (
        <DragGhost
          piece={activeDrag.piece}
          x={activeDrag.x}
          y={activeDrag.y}
          size={activeDrag.size}
        />
      )}
    </div>
  );
}
