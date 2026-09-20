"use client";

import { useEffect, useState } from "react";
import { Piece } from "@/components/Piece";
import { DIE_FACES } from "@/rules/dice";
import { FACE_CHANGE_MS, ROLL_ANIMATION_MS } from "./constants";
import styles from "./styles.module.scss";
import type { DiceProps } from "./types";

/**
 * This turn's dice: each one lets the player move a piece of that type. For
 * the first moments of every roll the dice tumble and flip through faces
 * before settling on the rolled one.
 */
export function Dice({ dice, color, rollId }: DiceProps) {
  // How far the animation of roll `id` has got. It is stale (a different id)
  // until the first tick of a new roll, which is exactly when it should read
  // as "rolling".
  const [frame, setFrame] = useState({ id: -1, step: 0 });

  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setFrame({ id: rollId, step });
      if (step * FACE_CHANGE_MS >= ROLL_ANIMATION_MS) clearInterval(timer);
    }, FACE_CHANGE_MS);
    return () => clearInterval(timer);
  }, [rollId]);

  const isRolling =
    frame.id !== rollId || frame.step * FACE_CHANGE_MS < ROLL_ANIMATION_MS;

  return (
    <div className={styles.dice}>
      <ul className={styles.row} aria-label="Dice">
        {dice.map((die, index) => (
          <li
            // A new key per roll remounts the die, which replays its animation.
            key={`${rollId}-${index}`}
            className={`${styles.die} ${die.used ? styles.used : ""}`}
            style={{ animationDelay: `${index * 120}ms` }}
            aria-label={`${die.type} die${die.used ? ", used" : ""}`}
          >
            <Piece
              piece={{
                type: isRolling
                  ? DIE_FACES[(frame.step + index * 2) % DIE_FACES.length]
                  : die.type,
                color,
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
